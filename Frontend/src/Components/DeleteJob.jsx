import React from 'react';

const DeleteJob = ({ job, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md rounded-2xl bg-[#1c2620] p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-[#29382f]">
          <h2 className="text-white text-2xl font-bold">Delete Job Posting</h2>
          <button 
            className="text-[#9eb7a8] hover:text-white"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" x2="6" y1="6" y2="18"></line>
              <line x1="6" x2="18" y1="6" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="mt-6">
          <p className="text-[#9eb7a8]">
            Are you sure you want to delete the job posting for <span className="font-semibold text-white">{job?.title}</span> at {job?.company}?
          </p>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button 
            className="rounded-full bg-[#29382f] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#3d5245]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJob;