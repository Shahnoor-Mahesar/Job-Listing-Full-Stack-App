import React from 'react';

const JobBoard = ({ jobs, onEdit, onDelete, pagination, onPageChange }) => {
 
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  
  const renderTags = (tagsString) => {
    if (!tagsString) return null;
    
    
    const tags = typeof tagsString === 'string' ? tagsString.split(',') : tagsString;
    const cleanedTags = tags.map(tag => tag.trim()).filter(tag => tag !== '');
    
    if (cleanedTags.length <= 3) {
      return (
        <div className="flex flex-wrap gap-1">
          {cleanedTags.map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-full bg-[#29382f] px-2 py-0.5 text-xs font-medium text-white">
              {tag}
            </span>
          ))}
        </div>
      );
    }
    
    // For more than 3 tags,
    const firstRow = cleanedTags.slice(0, 3);
    const secondRow = cleanedTags.slice(3, 6);
    
    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          {firstRow.map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-full bg-[#29382f] px-2 py-0.5 text-xs font-medium text-white">
              {tag}
            </span>
          ))}
        </div>
        {secondRow.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {secondRow.map((tag, index) => (
              <span key={index} className="inline-flex items-center rounded-full bg-[#29382f] px-2 py-0.5 text-xs font-medium text-white">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  
  const generatePageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages = [];
    
    
    pages.push(1);
    
    
    if (page > 3) {
      pages.push('...');
    }
    
    
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    
    
    if (page < totalPages - 2) {
      pages.push('...');
    }
    
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-full overflow-x-auto">
        <div className="inline-block min-w-full rounded-lg border border-[#29382f] bg-[#1c2620]">
          <table className="min-w-full divide-y divide-[#29382f]">
            <thead className="bg-[#111714]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Company
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Job Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Tags
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Posting Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#9eb7a8]" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29382f]">
              {safeJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-3 text-center text-sm text-[#9eb7a8]">
                    No jobs found
                  </td>
                </tr>
              ) : (
                safeJobs.map(job => (
                  <tr key={job.id} className="hover:bg-[#29382f]/30"> {/* Use job.id as key */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white max-w-[150px] truncate">
                      {job.title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#9eb7a8] max-w-[120px] truncate">
                      {job.company}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#9eb7a8] max-w-[120px] truncate">
                      {job.city}, {job.country}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#9eb7a8]">
                      {job.job_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9eb7a8] max-w-[180px]">
                      {renderTags(job.tags)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#9eb7a8]">
                      {job.posting_date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onEdit(job)}
                          className="p-1 text-[#38e07b] hover:text-[#52f08f]"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button 
                          onClick={() => onDelete(job)}
                          className="p-1 text-red-500 hover:text-red-400"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <nav aria-label="Pagination" className="inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center rounded-l-md border border-[#29382f] px-3 py-1.5 text-sm font-medium ${
                pagination.page === 1 
                  ? 'bg-[#1c2620] text-[#6a7f71] cursor-not-allowed' 
                  : 'bg-[#1c2620] text-[#9eb7a8] hover:bg-[#29382f] hover:text-white'
              }`}
            >
              Prev
            </button>
            
            {generatePageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                className={`relative inline-flex items-center border border-[#29382f] px-3 py-1.5 text-sm font-medium ${
                  pageNum === pagination.page
                    ? 'z-10 border-[#38e07b] bg-[#38e07b] text-[#111714]'
                    : pageNum === '...'
                    ? 'bg-[#1c2620] text-[#9eb7a8] cursor-default'
                    : 'bg-[#1c2620] text-[#9eb7a8] hover:bg-[#29382f] hover:text-white'
                } ${index === 0 ? 'md:inline-flex' : ''}`}
                disabled={pageNum === '...'}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`relative inline-flex items-center rounded-r-md border border-[#29382f] px-3 py-1.5 text-sm font-medium ${
                pagination.page === pagination.totalPages
                  ? 'bg-[#1c2620] text-[#6a7f71] cursor-not-allowed' 
                  : 'bg-[#1c2620] text-[#9eb7a8] hover:bg-[#29382f] hover:text-white'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default JobBoard;