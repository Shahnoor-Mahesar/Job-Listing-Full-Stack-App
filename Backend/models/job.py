from ..db import db
from datetime import datetime

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255))
    company = db.Column(db.String(255))
    city = db.Column(db.String(255))
    country = db.Column(db.String(255))
    posting_date = db.Column(db.Date)  
    job_type = db.Column(db.String(255), default='Full-Time')
    tags = db.Column(db.Text)
    link = db.Column(db.String(255))
    job_id = db.Column(db.String(50), unique=True)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            if key == 'tags' and isinstance(value, list):
                value = ','.join(value)
            setattr(self, key, value)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'city': self.city,
            'country': self.country,
            'posting_date': self.posting_date.strftime('%Y-%m-%d') if self.posting_date else None,
            'job_type': self.job_type,
            'tags': self.tags,
            'link': self.link,
            'job_id': self.job_id
        }