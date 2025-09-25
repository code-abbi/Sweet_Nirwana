// frontend/src/components/CheckoutModal.tsx
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CartItem } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/100x100/FBF9F6/8B4513?text=No+Image';
  return `${API_BASE_URL}${imageUrl}`;
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  userEmail?: string;
  onOrderComplete: (orderData: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  userEmail = '',
  onOrderComplete,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: userEmail,
    address: '',
    city: '',
    pincode: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.cartQuantity, 0);

  // Validation functions
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Delivery information validation
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'Phone must be 10 digits';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits';
    
    // Payment information validation
    if (!formData.cardholderName.trim()) errors.cardholderName = 'Cardholder name is required';
    if (!formData.cardNumber.trim()) errors.cardNumber = 'Card number is required';
    else if (formData.cardNumber.replace(/\s/g, '').length !== 16) errors.cardNumber = 'Card number must be 16 digits';
    else if (!/^\d+$/.test(formData.cardNumber.replace(/\s/g, ''))) errors.cardNumber = 'Card number can only contain digits';
    if (!formData.expiryDate.trim()) errors.expiryDate = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) errors.expiryDate = 'Expiry date must be MM/YY format';
    else {
      // Check if expiry date is not in the past
      const [month, year] = formData.expiryDate.split('/');
      const expiryDate = new Date(parseInt('20' + year), parseInt(month) - 1);
      const currentDate = new Date();
      currentDate.setDate(1); // Set to first day of current month for comparison
      if (expiryDate < currentDate) errors.expiryDate = 'Card has expired';
    }
    if (!formData.cvv.trim()) errors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(formData.cvv)) errors.cvv = 'CVV must be 3 or 4 digits';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    // Format expiry date
    else if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
    }
    // Format phone number
    else if (field === 'phone') {
      formattedValue = value.replace(/\D/g, '').substring(0, 10);
    }
    // Format pincode
    else if (field === 'pincode') {
      formattedValue = value.replace(/\D/g, '').substring(0, 6);
    }
    // Format CVV
    else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order data
      const orderData = {
        items: cartItems,
        totalAmount: totalPrice,
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        paymentInfo: {
          cardholderName: formData.cardholderName,
          cardNumber: formData.cardNumber.slice(-4), // Only store last 4 digits
          expiryDate: formData.expiryDate
        },
        orderDate: new Date().toISOString()
      };
      
      // Call parent component to handle order completion (including stock updates)
      onOrderComplete(orderData);
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: userEmail,
        address: '',
        city: '',
        pincode: '',
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
      
      alert('🎉 Order placed successfully! Thank you for your purchase.');
      onClose();
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">🛒 Checkout</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="lg:order-2">
              <h3 className="text-xl font-bold text-white mb-4">📋 Order Summary</h3>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-white/10">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <p className="text-sm text-gray-300">Qty: {item.cartQuantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-orange">₹{(parseFloat(item.price) * item.cartQuantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between items-center text-xl font-bold text-white">
                    <span>Total:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:order-1">
              <div className="space-y-6">
                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">🚚 Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.fullName ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter your full name"
                      />
                      {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.phone ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter 10-digit phone number"
                      />
                      {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.email ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter your email"
                      />
                      {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Complete Address *</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.address ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                      {formErrors.address && <p className="text-red-400 text-xs mt-1">{formErrors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.city ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter your city"
                      />
                      {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.pincode ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter 6-digit pincode"
                      />
                      {formErrors.pincode && <p className="text-red-400 text-xs mt-1">{formErrors.pincode}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">💳 Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        value={formData.cardholderName}
                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.cardholderName ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="Enter name on card"
                      />
                      {formErrors.cardholderName && <p className="text-red-400 text-xs mt-1">{formErrors.cardholderName}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Card Number *</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.cardNumber ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {formErrors.cardNumber && <p className="text-red-400 text-xs mt-1">{formErrors.cardNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.expiryDate ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {formErrors.expiryDate && <p className="text-red-400 text-xs mt-1">{formErrors.expiryDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">CVV *</label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg bg-white/5 text-white placeholder-gray-400 ${formErrors.cvv ? 'border-red-500' : 'border-white/20'} focus:border-brand-orange focus:outline-none`}
                        placeholder="123"
                        maxLength={4}
                      />
                      {formErrors.cvv && <p className="text-red-400 text-xs mt-1">{formErrors.cvv}</p>}
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="pt-6">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || cartItems.length === 0}
                    className={`w-full font-bold py-4 rounded-lg text-lg transition-all duration-300 ${
                      isProcessing
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-orange to-yellow-500 hover:from-yellow-500 hover:to-brand-orange text-white hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      `🎉 Place Order - ₹${totalPrice.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};