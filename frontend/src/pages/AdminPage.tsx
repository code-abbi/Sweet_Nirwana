import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
          <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
          <button className="btn-primary">Manage Users</button>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Reports</h3>
          <p className="text-gray-600 mb-4">View detailed system reports and analytics</p>
          <button className="btn-primary">View Reports</button>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
          <p className="text-gray-600 mb-4">Configure system-wide settings</p>
          <button className="btn-primary">Settings</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;