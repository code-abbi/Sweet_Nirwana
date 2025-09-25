import React, { useState } from 'react';
import { Sweet } from '../types';
import { PencilIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface AdminPanelProps {
  sweets: Sweet[];
  onAddSweet: (sweetData: Omit<Sweet, 'id'>) => Promise<boolean>;
  onUpdateStock: (sweetId: string, newQuantity: number) => Promise<boolean>;
  onDeleteSweet: (sweetId: string) => Promise<boolean>;
  onClose: () => void;
}

interface NewSweetData {
  name: string;
  category: string;
  price: string;
  quantity: string;
  description: string;
  imageUrl?: string;
}



export const AdminPanel: React.FC<AdminPanelProps> = ({
  sweets,
  onAddSweet,
  onUpdateStock,
  onDeleteSweet,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'add'>('stock');
  const [editingStock, setEditingStock] = useState<{[key: string]: number}>({});
  const [newSweet, setNewSweet] = useState<NewSweetData>({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [deletingSweet, setDeletingSweet] = useState<string | null>(null);
  const [imageSelectionMode, setImageSelectionMode] = useState<'upload'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleStockChange = (sweetId: string, newQuantity: number) => {
    setEditingStock(prev => ({
      ...prev,
      [sweetId]: Math.max(0, newQuantity)
    }));
  };

  const handleUpdateStock = async (sweetId: string) => {
    const newQuantity = editingStock[sweetId];
    if (newQuantity !== undefined) {
      setLoading(true);
      const success = await onUpdateStock(sweetId, newQuantity);
      setLoading(false);
      
      if (success) {
        // Remove from editing state
        setEditingStock(prev => {
          const newState = { ...prev };
          delete newState[sweetId];
          return newState;
        });
      } else {
        alert('Failed to update stock. Please try again.');
      }
    }
  };

  const validateNewSweet = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!newSweet.name.trim()) newErrors.name = 'Name is required';
    if (!newSweet.category.trim()) newErrors.category = 'Category is required';
    if (!newSweet.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(newSweet.price)) || parseFloat(newSweet.price) <= 0) {
      newErrors.price = 'Price must be a valid number greater than 0';
    }
    if (!newSweet.quantity.trim()) newErrors.quantity = 'Quantity is required';
    else if (isNaN(parseInt(newSweet.quantity)) || parseInt(newSweet.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a valid number 0 or greater';
    }
    if (!newSweet.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSweet = async () => {
    if (!validateNewSweet()) return;
    
    setLoading(true);
    const sweetData = {
      name: newSweet.name,
      category: newSweet.category,
      price: newSweet.price,
      quantity: parseInt(newSweet.quantity),
      description: newSweet.description,
      imageUrl: newSweet.imageUrl || '/images/mithai.jpeg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const success = await onAddSweet(sweetData);
    setLoading(false);
    
    if (success) {
      // Reset form
      setNewSweet({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
        imageUrl: ''
      });
      setImageSelectionMode('upload'); // Reset to upload mode
      setSelectedFile(null); // Reset selected file
      setErrors({});
      alert('Sweet added successfully!');
    } else {
      alert('Failed to add sweet. Please try again.');
    }
  };

  const handleInputChange = (field: keyof NewSweetData, value: string) => {
    setNewSweet(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeleteSweet = async (sweetId: string, sweetName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${sweetName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    setDeletingSweet(sweetId);
    const success = await onDeleteSweet(sweetId);
    setDeletingSweet(null);
    
    if (success) {
      alert(`${sweetName} has been deleted successfully.`);
    } else {
      alert('Failed to delete sweet. Please try again.');
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3001/api/sweets/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setNewSweet(prev => ({ ...prev, imageUrl: result.imagePath }));
        setSelectedFile(null);
        alert(`Image "${file.name}" uploaded successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to upload image: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, WebP, etc.)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-brand-palace">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'stock'
                ? 'text-brand-palace border-b-2 border-brand-palace bg-brand-bg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PencilIcon className="w-4 h-4 inline mr-2" />
            Manage Inventory
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'add'
                ? 'text-brand-palace border-b-2 border-brand-palace bg-brand-bg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            Add New Sweet
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'stock' ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Manage Sweet Inventory</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update stock quantities or permanently delete sweets from your inventory.
              </p>
              <div className="space-y-4">
                {sweets.map(sweet => (
                  <div key={sweet.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={`http://localhost:3001${sweet.imageUrl}`} 
                        alt={sweet.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/mithai.jpeg';
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-brand-palace">{sweet.name}</h4>
                        <p className="text-sm text-gray-600">Current Stock: {sweet.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={editingStock[sweet.id] !== undefined ? editingStock[sweet.id] : sweet.quantity}
                        onChange={(e) => handleStockChange(sweet.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <button
                        onClick={() => handleUpdateStock(sweet.id)}
                        disabled={loading || editingStock[sweet.id] === undefined || editingStock[sweet.id] === sweet.quantity}
                        className="px-3 py-1 bg-brand-palace text-white rounded text-sm hover:bg-brand-palace/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteSweet(sweet.id, sweet.name)}
                        disabled={deletingSweet === sweet.id || loading}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        title="Delete this sweet permanently"
                      >
                        {deletingSweet === sweet.id ? (
                          'Deleting...'
                        ) : (
                          <>
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Add New Sweet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newSweet.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter sweet name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={newSweet.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Milk-based, Syrup-based"
                  />
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSweet.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter price per piece"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={newSweet.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter initial stock quantity"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={newSweet.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    rows={3}
                    placeholder="Describe the sweet, ingredients, taste, etc."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sweet Image</label>
                  <p className="text-xs text-gray-500 mb-3">Upload an image from your computer (PNG, JPG, WebP up to 5MB)</p>

                  {/* Image Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-palace transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        📁
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-brand-palace">Click to upload image</span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </label>
                  </div>
                  
                  {uploading && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-palace"></div>
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}

                  {selectedFile && !uploading && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                      <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
                    </div>
                  )}

                  {/* Upload Image Preview */}
                  {newSweet.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={`http://localhost:3001${newSweet.imageUrl}`}
                        alt="Uploaded Preview"
                        className="w-20 h-20 rounded-lg object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23ddd"/><text x="40" y="40" text-anchor="middle" dy=".3em" fill="%23999">Upload Failed</text></svg>';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Uploaded Image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddSweet}
                  disabled={loading}
                  className="px-6 py-2 bg-brand-palace text-white rounded-lg hover:bg-brand-palace/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Sweet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};