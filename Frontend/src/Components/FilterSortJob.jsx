import React from 'react';

const FilterSortJob = ({ 
  searchTerm, 
  setSearchTerm, 
  jobTypeFilter, 
  setJobTypeFilter, 
  locationFilter, 
  setLocationFilter, 
  sortBy,
  setSortBy,
  jobs 
}) => {
  // Extract unique locations from jobs
  const locations = ['All Locations', ...new Set(jobs.map(job => `${job.city}, ${job.country}`))];
  
  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9eb7a8]">search</span>
            <input 
              className="w-full rounded-md border border-[#29382f] bg-[#1c2620] py-2 pl-10 pr-4 text-white placeholder-[#9eb7a8] focus:border-[#38e07b] focus:ring-[#38e07b]" 
              placeholder="Search by title, company, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select 
              className="rounded-md border border-[#29382f] bg-[#1c2620] py-2 pl-3 pr-8 text-white focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
            >
              <option>All Job Types</option>
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
            <select 
              className="rounded-md border border-[#29382f] bg-[#1c2620] py-2 pl-3 pr-8 text-white focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map((location, index) => (
                <option key={index}>{location}</option>
              ))}
            </select>
            <select 
              className="rounded-md border border-[#29382f] bg-[#1c2620] py-2 pl-3 pr-8 text-white focus:border-[#38e07b] focus:ring-[#38e07b] text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="posting_date_desc">Newest First</option>
              <option value="posting_date_asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSortJob;