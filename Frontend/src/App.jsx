import React, { useState, useEffect } from 'react';
import { getJobs, createJob, updateJob, deleteJob } from './api';
import JobBoard from './Pages/JobBoard';
import AddEditJob from './Components/AddEditJob';
import DeleteJob from './Components/DeleteJob';
import FilterSortJob from './Components/FilterSortJob';

function App() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [jobTypeFilter, setJobTypeFilter] = useState('All Job Types');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [sortBy, setSortBy] = useState('posting_date_desc');
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    totalJobs: 0,
    totalPages: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [jobTypeFilter, locationFilter, sortBy, pagination.page]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = {
        jobType: jobTypeFilter !== 'All Job Types' ? jobTypeFilter : null,
        location: locationFilter !== 'All Locations' ? locationFilter : null,
        sort: sortBy,
        page: pagination.page,
        perPage: pagination.perPage
      };
      
      const response = await getJobs(params);
      const { jobs: jobsData, meta } = response.data;
      
      setJobs(jobsData);
      setPagination(prev => ({
        ...prev,
        totalJobs: meta.total_jobs,
        totalPages: meta.total_pages
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

 const handleAddJob = async (jobData) => {
    try {
      setError('');
      const response = await createJob(jobData);
      setShowAddForm(false);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error adding job:', error);
      setError(error.response?.data?.error || 'Failed to add job. Please try again.');
    }
  };

  const handleEditJob = async (jobData) => {
    try {
      setError('');
      // Use the database ID (id) for API calls
      const response = await updateJob(editingJob.id, jobData);
      setEditingJob(null);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error updating job:', error);
      setError(error.response?.data?.error || 'Failed to update job. Please try again.');
    }
  };

  const handleDeleteJob = async () => {
    try {
      setError('');
      // Use the database ID (id) for API calls
      await deleteJob(deletingJob.id);
      setDeletingJob(null);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting job:', error);
      setError(error.response?.data?.error || 'Failed to delete job. Please try again.');
    }
  };

// // Add this function to parse relative dates on the frontend
// const parseRelativeDate = (relativeDate) => {
//   if (!relativeDate) return new Date();
  
//   // Extract the number and unit
//   const match = relativeDate.match(/(\d+)\s*([dhms])\s*ago/i);
//   if (!match) return new Date();
  
//   const number = parseInt(match[1]);
//   const unit = match[2].toLowerCase();
  
//   const now = new Date();
  
//   // Calculate the actual date based on the unit
//   if (unit === 'd') {  // days
//     return new Date(now.getTime() - (number * 24 * 60 * 60 * 1000));
//   } else if (unit === 'h') {  // hours
//     return new Date(now.getTime() - (number * 60 * 60 * 1000));
//   } else if (unit === 'm') {  // minutes
//     return new Date(now.getTime() - (number * 60 * 1000));
//   } else if (unit === 's') {  // seconds
//     return new Date(now.getTime() - (number * 1000));
//   }
  
//   return new Date();
// };

// In your filterJobs function, add sorting logic:
const filterJobs = () => {
  if (!Array.isArray(jobs)) {
    setFilteredJobs([]);
    return;
  }
  
  let filtered = [...jobs];
  
  // Apply search filter
  if (searchTerm.trim()) {
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.tags && typeof job.tags === 'string' && job.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // // Apply sorting by date
  // if (sortBy === 'posting_date_desc') {
  //   filtered.sort((a, b) => parseRelativeDate(b.posting_date) - parseRelativeDate(a.posting_date));
  // } else if (sortBy === 'posting_date_asc') {
  //   filtered.sort((a, b) => parseRelativeDate(a.posting_date) - parseRelativeDate(b.posting_date));
  // }
  
  setFilteredJobs(filtered);
};

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111714] flex items-center justify-center">
        <div className="text-lg text-[#9eb7a8]">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111714] text-white" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <header className="flex items-center justify-between border-b border-[#29382f] px-4 py-4 md:px-10 md:py-5">
        <div className="flex items-center gap-4">
          <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_6_535)">
              <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="clip0_6_535">
                <rect fill="white" height="48" width="48"></rect>
              </clipPath>
            </defs>
          </svg>
          <h1 className="text-xl font-bold tracking-tight">BitBash-Job Board</h1>
        </div>
        <button 
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#38e07b] text-[#111714] text-sm font-bold shadow-lg transition-transform hover:scale-105"
          onClick={() => setShowAddForm(true)}
        >
          <span className="truncate">Add Job</span>
        </button>
      </header>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      
      <FilterSortJob 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        jobTypeFilter={jobTypeFilter}
        setJobTypeFilter={setJobTypeFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        jobs={jobs}
      />
      
      <JobBoard 
        jobs={filteredJobs}
        onEdit={setEditingJob}
        onDelete={setDeletingJob}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
      
      {showAddForm && (
        <AddEditJob
          onClose={() => setShowAddForm(false)}
          onSave={handleAddJob}
        />
      )}
      
      {editingJob && (
        <AddEditJob
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleEditJob}
        />
      )}
      
      {deletingJob && (
        <DeleteJob
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onConfirm={handleDeleteJob}
        />
      )}
    </div>
  );
}

export default App;