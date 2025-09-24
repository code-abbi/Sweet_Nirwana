import React from 'react';

const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="space-x-2">
          <button className="btn-secondary">Restock</button>
          <button className="btn-primary">Purchase</button>
        </div>
      </div>
      
      <div className="card">
        <div className="p-6">
          <p className="text-gray-600">Inventory management functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;