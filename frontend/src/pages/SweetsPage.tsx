import React from 'react';

const SweetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sweets Management</h1>
        <button className="btn-primary">Add Sweet</button>
      </div>
      
      <div className="card">
        <div className="p-6">
          <p className="text-gray-600">Sweet management functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default SweetsPage;