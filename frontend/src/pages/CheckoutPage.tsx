// frontend/src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { CartItem } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/100x100/FBF9F6/8B4513?text=No+Image';
  return `${API_BASE_URL}${imageUrl}`;
};

const CheckoutPage: React.FC = () => {
  const { isSignedIn, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    pincode: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (location.state && location.state.cart) {
      setCart(location.state.cart);
    } else {
      // If no cart data is passed, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.cartQuantity, 0);

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

  const handlePlaceOrder = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    
    // Simulate payment processing
    alert('Order placed successfully! Thank you for your purchase.');
    
    // Clear cart from localStorage and navigate home
    localStorage.removeItem('sweet_shop_cart');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navigation
        isSignedIn={!!isSignedIn}
        isAdmin={user?.isAdmin || false}
        totalItems={0} // Cart is on the page, not in the nav here
        onCartToggle={() => navigate('/')} // Go back to shop
        onSignOut={signOut}
        onSignIn={() => {}} // Should not be needed here
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="bg-brand-bg-light p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-brand-palace mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold text-brand-palace">{item.name}</p>
                    <p className="text-sm text-brand-palace/70">Qty: {item.cartQuantity}</p>
                  </div>
                  <p className="font-semibold text-brand-palace">
                    ₹{(parseFloat(item.price) * item.cartQuantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-brand-palace/20">
              <div className="flex justify-between items-center text-lg font-bold text-brand-palace">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Details */}
          <div className="bg-brand-bg-light p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-brand-palace mb-6">Checkout Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }}>
              <div className="space-y-8">
                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-palace mb-4">Delivery Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.fullName ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>
                    <div>
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.phone ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.email ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Complete Address" 
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.address ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="City" 
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.city ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Pincode (6 digits)" 
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.pincode ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-palace mb-4">Payment Information</h3>
                  <div className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Cardholder Name" 
                        value={formData.cardholderName}
                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${formErrors.cardholderName ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.cardholderName && <p className="text-red-500 text-sm mt-1">{formErrors.cardholderName}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        maxLength={19}
                        className={`w-full p-3 rounded-lg border ${formErrors.cardNumber ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                        required 
                      />
                      {formErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          maxLength={5}
                          className={`w-full p-3 rounded-lg border ${formErrors.expiryDate ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                          required 
                        />
                        {formErrors.expiryDate && <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>}
                      </div>
                      <div>
                        <input 
                          type="text" 
                          placeholder="CVV" 
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          maxLength={4}
                          className={`w-full p-3 rounded-lg border ${formErrors.cvv ? 'border-red-500' : 'border-brand-palace/20'} bg-white`} 
                          required 
                        />
                        {formErrors.cvv && <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full mt-8 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-4 rounded-lg text-lg transition-colors">
                Place Order - ₹{totalPrice.toFixed(2)}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;