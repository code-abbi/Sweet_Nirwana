import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSweets, useInventoryStatus, useLowStockAlerts, useTransactions } from '../hooks/useApi';
import { formatCurrency, formatRelativeTime, getStockStatusBgColor, isAdmin } from '../utils/helpers';
import { 
  CakeIcon, 
  ExclamationTriangleIcon, 
  CurrencyDollarIcon,
  ShoppingCartIcon 
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const { sweets, isLoading: sweetsLoading } = useSweets();
  const { inventory, isLoading: inventoryLoading } = useInventoryStatus();
  const { alerts, isLoading: alertsLoading } = useLowStockAlerts();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  // Calculate dashboard metrics
  const totalSweets = sweets.length;
  const lowStockCount = alerts.length;
  const totalRevenue = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.price * t.quantity), 0);
  
  const todaysTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at).toDateString();
    const today = new Date().toDateString();
    return transactionDate === today && t.type === 'purchase';
  });
  
  const todaysSales = todaysTransactions.reduce((sum, t) => sum + (t.price * t.quantity), 0);

  const recentTransactions = transactions
    .slice(0, 5)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (sweetsLoading || inventoryLoading || alertsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {state.user?.full_name}!</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CakeIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Sweets</h3>
              <p className="text-3xl font-bold text-primary-600 mt-1">{totalSweets}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{lowStockCount}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Today's Sales</h3>
              <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(todaysSales)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
              <p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No low stock alerts</p>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.sweet?.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusBgColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.sweet?.name}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.type === 'purchase' ? 'Purchased' : 'Restocked'} by {transaction.user?.username}
                      </p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(transaction.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">×{transaction.quantity}</p>
                      <p className={`text-sm ${transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.type === 'purchase' ? '-' : '+'}{formatCurrency(transaction.price * transaction.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions for Admin */}
      {isAdmin(state.user?.role || '') && (
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn-primary">Add New Sweet</button>
              <button className="btn-secondary">Restock Items</button>
              <button className="btn-secondary">View All Reports</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;