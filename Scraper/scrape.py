import logging
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import mysql.connector
from datetime import datetime, timedelta
import calendar


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Database connection
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = 'root'
DB_NAME = 'actuary_jobs_dbb'

JOBS_URL = "https://www.actuarylist.com"

def setup_database():
    try:
        conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        conn.database = DB_NAME
        
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                company VARCHAR(255),
                city VARCHAR(255),
                country VARCHAR(255),
                posting_date DATE,  -- Changed to DATE type
                job_type VARCHAR(255) DEFAULT 'Full-Time',
                tags TEXT,
                link VARCHAR(255),
                job_id VARCHAR(50),
                UNIQUE KEY unique_job (job_id)
            )
        """)
        
        conn.commit()
        logging.info("Database and table ready.")
        return conn, cursor
    except mysql.connector.Error as err:
        logging.error(f"Database error: {err}")
        exit(1)

def setup_driver():
    """Initialize Selenium WebDriver with Chrome."""
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") 
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
    options.add_argument("--log-level=3")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

def handle_popup(driver):
    """Close any popups if present."""
    try:
        close_popup = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Cancel') or contains(text(), 'Close')]"))
        )
        driver.execute_script("arguments[0].click();", close_popup)
        logging.info("Closed popup.")
    except:
        logging.info("No popup detected.")

def extract_job_id(url):
    """Extract jobId from URL (e.g., 33794 from /actuarial-jobs/33794-metlife)."""
    match = re.search(r'/actuarial-jobs/(\d+)-', url)
    return match.group(1) if match else None

def convert_relative_date(relative_date):
    """
    Convert relative date strings like '8d ago', '2h ago', '3m ago', '1y ago' to actual dates.
    Returns a date string in 'YYYY-MM-DD' format.
    """
    if not relative_date:
        return datetime.now().strftime('%Y-%m-%d')
    
    
    match = re.match(r'(\d+)\s*([dhmy])\s*ago', relative_date.lower())
    if not match:
        return datetime.now().strftime('%Y-%m-%d')
    
    number, unit = match.groups()
    number = int(number)
    
    
    current_date = datetime.now()
    
   
    if unit == 'd':  # days
        result_date = current_date - timedelta(days=number)
    elif unit == 'h':  # hours
        result_date = current_date - timedelta(hours=number)
    elif unit == 'm':  # months
        
        month = current_date.month - number
        year = current_date.year
        while month <= 0:
            month += 12
            year -= 1
        
        
        _, last_day = calendar.monthrange(year, month)
        day = min(current_date.day, last_day)
        
        result_date = datetime(year, month, day)
    elif unit == 'y':  # years
        result_date = current_date.replace(year=current_date.year - number)
    else:
        result_date = current_date
    
    return result_date.strftime('%Y-%m-%d')

def scrape_job_details(driver, url):
    """Scrape job details from a job posting page."""
    try:
        
        driver.execute_script("window.location.href = arguments[0];", url)
        WebDriverWait(driver, 20).until(EC.url_contains("/actuarial-jobs/"))
        
        
        if len(driver.window_handles) > 1:
            driver.switch_to.window(driver.window_handles[0])
            for handle in driver.window_handles[1:]:
                driver.switch_to.window(handle)
                driver.close()
            driver.switch_to.window(driver.window_handles[0])
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Extract fields
        job_title = soup.find('p', class_='Job_job-card__position__ic1rc')
        job_title = job_title.text.strip() if job_title else ''

        company = soup.find('p', class_='Job_job-card__company__7T9qY')
        company = company.text.strip() if company else ''

        location_div = soup.find('div', class_='Job_job-card__locations__x1exr')
        city = ''
        country = ''
        if location_div:
            country_elem = location_div.find('a', class_='Job_job-card__country__GRVhK')
            country = country_elem.text.strip() if country_elem else ''
            
            city_elems = location_div.find_all('a', class_='Job_job-card__location__bq7jX')
            cities = [elem.text.strip() for elem in city_elems if elem.text.strip()]
            city = ', '.join(cities) if cities else ''

        posting_date_elem = soup.find('p', class_='Job_job-card__posted-on__NCZaJ')
        posting_date_relative = posting_date_elem.text.strip() if posting_date_elem else None
        
        # Convert relative date to actual date
        posting_date_actual = convert_relative_date(posting_date_relative) if posting_date_relative else None

        tags_div = soup.find('div', class_='Job_mobile-tag-container__PE6K3')
        tags_str = ''
        if tags_div:
            tags = [tag.text.strip() for tag in tags_div.find_all('a', class_='Job_job-card__location__bq7jX')]
            tags_str = ', '.join(tags)

        job_id = extract_job_id(url)
        job_type = 'Full-Time'  

        return {
            'title': job_title,
            'company': company,
            'city': city,
            'country': country,
            'posting_date': posting_date_actual,  
            'posting_date_relative': posting_date_relative,  
            'job_type': job_type,
            'tags': tags_str,
            'link': url,
            'job_id': job_id
        }
    except Exception as e:
        logging.error(f"Error scraping job details for {url}: {e}")
        return None

def save_job_to_db(cursor, conn, job_data):
    """Save job data to MySQL database."""
    if not job_data:
        return
    try:
        cursor.execute("""
            INSERT IGNORE INTO jobs 
            (title, company, city, country, posting_date, job_type, tags, link, job_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            job_data['title'],
            job_data['company'],
            job_data['city'],
            job_data['country'],
            job_data['posting_date'], 
            job_data['job_type'],
            job_data['tags'],
            job_data['link'],
            job_data['job_id']
        ))
        conn.commit()
        logging.info(f"Saved job: {job_data['title']} at {job_data['company']} (Posted: {job_data['posting_date']})")
    except mysql.connector.Error as err:
        logging.error(f"Database error saving job {job_data['title']}: {err}")

def wait_for_job_cards(driver, max_attempts=3, wait_time=10):
    """Wait for job cards to load with retries."""
    for attempt in range(max_attempts):
        try:
            section = WebDriverWait(driver, wait_time).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "section.Job_grid-section__kgIsR"))
            )
            cards = section.find_elements(By.CSS_SELECTOR, ".Job_job-card__YgDAV.Job_job-card-active__6V_ep")
            if len(cards) > 0:
                return cards
            logging.info(f"No job cards found on attempt {attempt + 1}. Retrying...")
            time.sleep(5)  
        except:
            logging.info(f"Attempt {attempt + 1} failed to find job section. Retrying...")
            time.sleep(5)
    logging.error("Failed to find job cards after retries. Saving page source for debugging.")
    with open(f"page_source_page_{attempt}.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    return []

def get_page_url(page):
    """Get the URL for a specific page."""
    return f"{JOBS_URL}?page={page}"

def main():
    """Main function to scrape jobs from Actuary List."""
    conn, cursor = setup_database()
    driver = setup_driver()

    try:
        
        driver.get(JOBS_URL)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        driver.execute_script("localStorage.setItem('showPopupForm', 'false');")
        driver.refresh()
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        handle_popup(driver)

        
        driver.get(get_page_url(1))
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        with open("page_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        logging.info("Saved page source to page_source.html")

        page = 1
        max_pages = 5  

        while page <= max_pages:
            logging.info(f"Scraping page {page}")
            try:
               
                if driver.current_url != get_page_url(page):
                    logging.warning(f"Unexpected URL: {driver.current_url}. Navigating to {get_page_url(page)}")
                    driver.get(get_page_url(page))
                    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

                
                cards = wait_for_job_cards(driver)
                logging.info(f"Found {len(cards)} job cards on page {page}")

                if len(cards) == 0:
                    logging.error(f"No job cards found on page {page}. Skipping to next page or exiting.")
                    break

                for idx in range(len(cards)):
                    try:
                        
                        section = WebDriverWait(driver, 20).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "section.Job_grid-section__kgIsR"))
                        )
                        cards = wait_for_job_cards(driver)
                        if idx >= len(cards):
                            logging.warning(f"Index {idx} exceeds available cards on page {page}. Skipping.")
                            continue
                        card = cards[idx]
                        a = WebDriverWait(card, 10).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "a.Job_job-page-link__a5I5g"))
                        )
                        link = a.get_attribute('href')
                        if not link or link.startswith("data:"):
                            logging.warning(f"Invalid link for job {idx}: {link}. Skipping.")
                            continue
                        logging.info(f"Processing job link: {link}")

                        
                        job_data = scrape_job_details(driver, link)
                        save_job_to_db(cursor, conn, job_data)

                        
                        driver.get(get_page_url(page))
                        WebDriverWait(driver, 20).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "section.Job_grid-section__kgIsR"))
                        )
                        time.sleep(2)

                    except Exception as e:
                        logging.error(f"Error processing job {idx} on page {page}: {e}")
                        try:
                            if len(driver.window_handles) > 1:
                                driver.switch_to.window(driver.window_handles[0])
                                for handle in driver.window_handles[1:]:
                                    driver.switch_to.window(handle)
                                    driver.close()
                                driver.switch_to.window(driver.window_handles[0])
                            driver.get(get_page_url(page))
                            WebDriverWait(driver, 20).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, "section.Job_grid-section__kgIsR"))
                            )
                        except:
                            logging.error("Failed to return to listings page. Continuing to next job.")
                        continue

                
                try:
                    next_button = WebDriverWait(driver, 10).until(
                        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Next')]"))
                    )
                    driver.execute_script("arguments[0].click();", next_button)
                    time.sleep(10)  
                    WebDriverWait(driver, 20).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "section.Job_grid-section__kgIsR"))
                    )
                    page += 1
                except:
                    logging.info("No more pages or Next button disabled.")
                    break

            except Exception as e:
                logging.error(f"Error on page {page}: {e}")
                break

    finally:
        if len(driver.window_handles) > 1:
            driver.switch_to.window(driver.window_handles[0])
            for handle in driver.window_handles[1:]:
                driver.switch_to.window(handle)
                driver.close()
            driver.switch_to.window(driver.window_handles[0])
        driver.quit()
        cursor.close()
        conn.close()
        logging.info("Scraping completed.")

if __name__ == "__main__":
    main()