import React, { useState, useRef } from 'react';
import { Sweet, NewSweetFormData } from '../types';
import { useToast } from './Toast';
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
  sweetType: 'indian' | 'global';
}



export const AdminPanel: React.FC<AdminPanelProps> = ({
  sweets,
  onAddSweet,
  onUpdateStock,
  onDeleteSweet,
  onClose
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stock' | 'add'>('stock');
  const [editingStock, setEditingStock] = useState<{[key: string]: number}>({});
  const [newSweet, setNewSweet] = useState<NewSweetData>({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    imageUrl: '',
    sweetType: 'indian'
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
        showToast('Failed to update stock. Please try again.', 'error');
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
        imageUrl: '',
        sweetType: 'indian'
      });
      setImageSelectionMode('upload'); // Reset to upload mode
      setSelectedFile(null); // Reset selected file
      setErrors({});
      showToast('Sweet added successfully!', 'success');
    } else {
      showToast('Failed to add sweet. Please try again.', 'error');
    }
  };

  const handleInputChange = (field: keyof NewSweetData, value: string) => {
    setNewSweet(prev => ({ 
      ...prev, 
      [field]: field === 'sweetType' ? (value as 'indian' | 'global') : value 
    }));
    
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
      showToast(`${sweetName} has been deleted successfully.`, 'success');
    } else {
      showToast('Failed to delete sweet. Please try again.', 'error');
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
        showToast(`Image "${file.name}" uploaded successfully!`, 'success');
      } else {
        const error = await response.json();
        showToast(`Failed to upload image: ${error.message}`, 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file (JPG, PNG, WebP, etc.)', 'warning');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'warning');
        return;
      }

      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/95 backdrop-blur-lg rounded-2xl w-full max-w-4xl h-5/6 mx-4 flex flex-col border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">🍬 Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'stock'
                ? 'text-brand-orange border-b-2 border-brand-orange bg-white/5'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <PencilIcon className="w-4 h-4 inline mr-2" />
            Manage Inventory
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'add'
                ? 'text-brand-orange border-b-2 border-brand-orange bg-white/5'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
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
              <h3 className="text-lg font-semibold mb-4 text-white">📦 Manage Sweet Inventory</h3>
              <p className="text-sm text-gray-300 mb-4">
                Update stock quantities or permanently delete sweets from your inventory.
              </p>
              <div className="space-y-4">
                {sweets.map(sweet => (
                  <div key={sweet.id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={`http://localhost:3001${sweet.imageUrl}`} 
                        alt={sweet.name}
                        className="w-12 h-12 rounded-lg object-cover border border-white/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/mithai.jpeg';
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-white">{sweet.name}</h4>
                        <p className="text-sm text-gray-300">Current Stock: {sweet.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={editingStock[sweet.id] !== undefined ? editingStock[sweet.id] : sweet.quantity}
                        onChange={(e) => handleStockChange(sweet.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-center text-white placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      />
                      <button
                        onClick={() => handleUpdateStock(sweet.id)}
                        disabled={loading || editingStock[sweet.id] === undefined || editingStock[sweet.id] === sweet.quantity}
                        className="px-3 py-1 bg-gradient-to-r from-brand-orange to-yellow-500 text-white rounded text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteSweet(sweet.id, sweet.name)}
                        disabled={deletingSweet === sweet.id || loading}
                        className="px-3 py-1 bg-red-600/80 text-white rounded text-sm hover:bg-red-600 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
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
              <h3 className="text-lg font-semibold mb-4 text-white">🍭 Add New Sweet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newSweet.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange ${errors.name ? 'border-red-500' : 'border-white/20'}`}
                    placeholder="Enter sweet name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                  <input
                    type="text"
                    value={newSweet.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange ${errors.category ? 'border-red-500' : 'border-white/20'}`}
                    placeholder={
                      newSweet.sweetType === 'indian' 
                        ? "e.g., Traditional, Bengali, Gujarati, Punjabi, South Indian" 
                        : "e.g., European, American, Continental, French, Italian"
                    }
                  />
                  {!errors.category && (
                    <p className="text-xs text-gray-400 mt-1">
                      {newSweet.sweetType === 'indian' 
                        ? "Indian categories: Traditional, Bengali, Gujarati, Punjabi, South Indian, etc."
                        : "Global categories: European, American, Continental, French, Italian, etc."
                      }
                    </p>
                  )}
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sweet Type *</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sweetType"
                        value="indian"
                        checked={newSweet.sweetType === 'indian'}
                        onChange={(e) => handleInputChange('sweetType', e.target.value)}
                        className="mr-2 text-brand-orange focus:ring-brand-orange focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">🇮🇳 Indian Classic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sweetType"
                        value="global"
                        checked={newSweet.sweetType === 'global'}
                        onChange={(e) => handleInputChange('sweetType', e.target.value)}
                        className="mr-2 text-brand-orange focus:ring-brand-orange focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">🌎 Global Delight</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Choose whether this is a traditional Indian sweet or a global dessert
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSweet.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange ${errors.price ? 'border-red-500' : 'border-white/20'}`}
                    placeholder="Enter price per piece"
                  />
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Initial Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={newSweet.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange ${errors.quantity ? 'border-red-500' : 'border-white/20'}`}
                    placeholder="Enter initial stock quantity"
                  />
                  {errors.quantity && <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                  <textarea
                    value={newSweet.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange ${errors.description ? 'border-red-500' : 'border-white/20'}`}
                    rows={3}
                    placeholder="Describe the sweet, ingredients, taste, etc."
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sweet Image</label>
                  <p className="text-xs text-gray-400 mb-3">Upload an image from your computer (PNG, JPG, WebP up to 5MB)</p>

                  {/* Image Upload Section */}
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-brand-orange transition-colors bg-white/5 backdrop-blur-sm">
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
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
                        📁
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-brand-orange">Click to upload image</span>
                        <span className="text-gray-300"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </label>
                  </div>
                  
                  {uploading && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-orange"></div>
                      <span className="text-sm text-gray-300">Uploading...</span>
                    </div>
                  )}

                  {selectedFile && !uploading && (
                    <div className="mt-2 p-2 bg-white/10 rounded border border-white/20">
                      <p className="text-sm text-gray-300">Selected: {selectedFile.name}</p>
                    </div>
                  )}

                  {/* Upload Image Preview */}
                  {newSweet.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={`http://localhost:3001${newSweet.imageUrl}`}
                        alt="Uploaded Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-white/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23ddd"/><text x="40" y="40" text-anchor="middle" dy=".3em" fill="%23999">Upload Failed</text></svg>';
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1">Uploaded Image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddSweet}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-brand-orange to-yellow-500 text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
                >
                  {loading ? '✨ Adding Sweet...' : '🍭 Add Sweet to Inventory'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};