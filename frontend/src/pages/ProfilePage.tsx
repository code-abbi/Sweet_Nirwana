import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { state } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <button className="btn-primary">Edit Profile</button>
      </div>
      
      <div className="card">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <p className="text-gray-900">{state.user?.full_name}</p>
            </div>
            <div>
              <label className="form-label">Username</label>
              <p className="text-gray-900">{state.user?.username}</p>
            </div>
            <div>
              <label className="form-label">Email</label>
              <p className="text-gray-900">{state.user?.email}</p>
            </div>
            <div>
              <label className="form-label">Role</label>
              <p className="text-gray-900 capitalize">{state.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;