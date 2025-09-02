import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET /jobs with filters
export const getJobs = (params = {}) => {
  const { jobType, location, tag, sort, page, perPage } = params;
  const queryParams = new URLSearchParams();
  
  if (jobType && jobType !== 'All Job Types') queryParams.append('job_type', jobType);
  if (location && location !== 'All Locations') queryParams.append('location', location);
  if (tag) queryParams.append('tag', tag);
  if (sort) queryParams.append('sort', sort);
  if (page) queryParams.append('page', page);
  if (perPage) queryParams.append('per_page', perPage);
  
  return api.get(`/jobs?${queryParams.toString()}`);
};

// GET /jobs/:id
export const getJob = (id) => api.get(`/jobs/${id}`);

// POST /jobs
export const createJob = (jobData) => {
  // Convert tags from string to array if needed
  const data = {
    ...jobData,
    tags: jobData.tags ? jobData.tags.split(',').map(tag => tag.trim()) : []
  };
  return api.post('/jobs', data);
};

// PUT /jobs/:id
export const updateJob = (id, jobData) => {
  // Convert tags from string to array if needed
  const data = {
    ...jobData,
    tags: jobData.tags ? jobData.tags.split(',').map(tag => tag.trim()) : []
  };
  return api.put(`/jobs/${id}`, data);
};

// DELETE /jobs/:id
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

export default api;