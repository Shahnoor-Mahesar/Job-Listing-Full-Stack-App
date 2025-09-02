import React, { useState, useEffect } from 'react';

const AddEditJob = ({ job, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    city: '',
    country: '',
    job_type: 'Full-Time',
    posting_date: new Date().toISOString().split('T')[0],
    tags: ''
  });

  useEffect(() => {
    if (job) {
      // Convert tags from array to string if needed
      const tagsValue = Array.isArray(job.tags) 
        ? job.tags.join(', ') 
        : job.tags || '';
        
      setFormData({
        title: job.title || '',
        company: job.company || '',
        city: job.city || '',
        country: job.country || '',
        job_type: job.job_type || 'Full-Time',
        posting_date: job.posting_date || new Date().toISOString().split('T')[0],
        tags: tagsValue
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-[#1c2620] p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#29382f]">
          <h2 className="text-white text-xl font-bold">{job ? 'Edit Job Posting' : 'Add a New Job Posting'}</h2>
          <button 
            className="text-[#9eb7a8] hover:text-white"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" x2="6" y1="6" y2="18"></line>
              <line x1="6" x2="18" y1="6" y2="18"></line>
            </svg>
          </button>
        </div>
        <form className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="title">Title</label>
            <div className="mt-1">
              <input
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white placeholder:text-[#6a7f71] focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="title"
                name="title"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="company">Company</label>
            <div className="mt-1">
              <input
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white placeholder:text-[#6a7f71] focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="company"
                name="company"
                placeholder="e.g. BitBash Inc."
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="city">City</label>
            <div className="mt-1">
              <input
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white placeholder:text-[#6a7f71] focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="city"
                name="city"
                placeholder="e.g. San Francisco"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="country">Country</label>
            <div className="mt-1">
              <input
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white placeholder:text-[#6a7f71] focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="country"
                name="country"
                placeholder="e.g. USA"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="job_type">Job Type</label>
            <div className="mt-1">
              <select
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="posting_date">Posting Date</label>
            <div className="mt-1">
              <input
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white placeholder:text-[#6a7f71] focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="posting_date"
                name="posting_date"
                type="date"
                value={formData.posting_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#9eb7a8]" htmlFor="tags">Tags</label>
            <div className="mt-1">
              <input
                className="block w-full rounded-xl border border-[#3d5245] bg-[#111714] p-2 text-white placeholder:text-[#6a7f71] focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
                id="tags"
                name="tags"
                placeholder="e.g. React, TypeScript, Tailwind CSS"
                value={formData.tags}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-[#6a7f71]">Separate tags with commas.</p>
            </div>
          </div>
          <div className="sm:col-span-2 mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              className="rounded-full bg-[#29382f] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3d5245]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="rounded-full bg-[#38e07b] px-4 py-2 text-sm font-bold text-[#111714] transition-opacity hover:opacity-90"
            >
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditJob;