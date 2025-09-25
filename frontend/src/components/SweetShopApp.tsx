import React, { useState, useEffect } from 'react';
import { 
  ShoppingBagIcon, 
  PlusIcon, 
  MinusIcon, 
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Sweet } from '../types';
import GoogleAuthModal from './GoogleAuthModal';

const ADMIN_EMAIL = 'wildrabit001@gmail.com';
const API_BASE_URL = 'http://localhost:3001';

// Helper function to get full image URL
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/images/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  return imageUrl;
};

interface CartItem extends Sweet {
  cartQuantity: number;
}

interface SweetWithQuantity extends Sweet {
  selectedQuantity: number;
}

const SweetShopApp: React.FC = () => {
  const { isSignedIn, user, signIn, signOut } = useAuth();
  const [sweets, setSweets] = useState<SweetWithQuantity[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddingSweetMode, setIsAddingSweetMode] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showGoogleOAuth, setShowGoogleOAuth] = useState(false);
  
  // Form validation state
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    address: '',
    city: '',
    pinCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Check if user is admin
  const isAdmin = isSignedIn && user?.isAdmin;

  // New sweet form data
  const [newSweet, setNewSweet] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: ''
  });

  // Form validation functions
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pinCode.trim()) errors.pinCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pinCode)) errors.pinCode = 'PIN code must be 6 digits';
    if (!formData.cardNumber.trim()) errors.cardNumber = 'Card number is required';
    else if (formData.cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Card number must be 16 digits';
    if (!formData.expiryDate.trim()) errors.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) errors.expiryDate = 'Expiry date must be in MM/YY format';
    if (!formData.cvv.trim()) errors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(formData.cvv)) errors.cvv = 'CVV must be 3 or 4 digits';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Update form data when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Cart persistence functions
  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem('sweet_shop_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  };

  const loadCartFromStorage = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem('sweet_shop_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  };

  const clearCartFromStorage = () => {
    try {
      localStorage.removeItem('sweet_shop_cart');
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  };

  // Load cart from storage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCart(savedCart);
  }, []);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      saveCartToStorage(cart);
    } else {
      clearCartFromStorage();
    }
  }, [cart]);

  // Fetch sweets from API
  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sweets');
      const data = await response.json();
      if (data.success) {
        // Add selectedQuantity to each sweet
        const sweetsWithQuantity = data.data.map((sweet: Sweet) => ({
          ...sweet,
          selectedQuantity: 1
        }));
        setSweets(sweetsWithQuantity);
      }
    } catch (error) {
      console.error('Error fetching sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSweetStock = async (id: string, newQuantity: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sweets/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: Math.max(0, newQuantity) }),
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setSweets(prevSweets =>
          prevSweets.map(sweet =>
            sweet.id === id ? { ...sweet, quantity: Math.max(0, newQuantity) } : sweet
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to update stock:', errorData);
        // Refresh from server if update failed
        await fetchSweets();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      // Refresh from server if there's an error
      await fetchSweets();
    }
  };

  // Get quantity of item in cart
  const getCartQuantity = (sweetId: string) => {
    const cartItem = cart.find(item => item.id === sweetId);
    return cartItem ? cartItem.cartQuantity : 0;
  };

  const addToCart = (sweet: SweetWithQuantity) => {
    if (!isSignedIn) {
      setShowSignInModal(true);
      return;
    }
    
    if (sweet.quantity === 0) {
      alert('This item is out of stock');
      return;
    }

    const currentInCart = getCartQuantity(sweet.id);
    if (currentInCart >= sweet.quantity) {
      alert('Cannot add more than available stock');
      return;
    }

    // Update stock in database and local state
    updateSweetStock(sweet.id, sweet.quantity - 1);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === sweet.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === sweet.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...sweet, cartQuantity: 1 }];
      }
    });
  };

  const updateCartItemQuantity = (sweetId: string, change: number) => {
    const currentInCart = getCartQuantity(sweetId);
    const sweet = sweets.find(s => s.id === sweetId);
    if (!sweet) return;

    const newQuantity = currentInCart + change;
    const totalAvailable = sweet.quantity + currentInCart; // Current stock + what's in cart
    
    if (newQuantity <= 0) {
      // Return all items to stock when removing from cart
      const cartItem = cart.find(item => item.id === sweetId);
      if (cartItem) {
        updateSweetStock(sweetId, sweet.quantity + cartItem.cartQuantity);
      }
      removeFromCart(sweetId);
    } else if (newQuantity > totalAvailable) {
      alert('Cannot add more than available stock');
    } else {
      // Calculate stock change: if increasing cart quantity, decrease stock
      const stockChange = change > 0 ? -change : -change; // -change because we're adding/removing from stock
      updateSweetStock(sweetId, sweet.quantity + stockChange);
      
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === sweetId
            ? { ...item, cartQuantity: newQuantity }
            : item
        )
      );
    }
  };

  const updateSelectedQuantity = (sweetId: string, newQuantity: number) => {
    setSweets(prevSweets =>
      prevSweets.map(s =>
        s.id === sweetId ? { ...s, selectedQuantity: Math.max(1, Math.min(newQuantity, s.quantity)) } : s
      )
    );
  };

  const removeFromCart = (sweetId: string) => {
    const cartItem = cart.find(item => item.id === sweetId);
    const sweet = sweets.find(s => s.id === sweetId);
    
    if (cartItem && sweet) {
      // Return all items to stock when removing from cart
      updateSweetStock(sweetId, sweet.quantity + cartItem.cartQuantity);
    }
    
    setCart(prevCart => prevCart.filter(item => item.id !== sweetId));
  };

  const updateCartQuantity = (sweetId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(sweetId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === sweetId
          ? { ...item, cartQuantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.cartQuantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
  };

    // Admin functions
  const updateStockQuantity = async (sweetId: string, change: number) => {
    try {
      const sweet = sweets.find(s => s.id === sweetId);
      if (!sweet) return;

      const newQuantity = Math.max(0, sweet.quantity + change);
      
      // Update locally first for immediate UI feedback
      setSweets(prevSweets =>
        prevSweets.map(s =>
          s.id === sweetId ? { ...s, quantity: newQuantity } : s
        )
      );

      // Here you would make API call to update backend
      // await updateSweetQuantityAPI(sweetId, newQuantity);
    } catch (error) {
      console.error('Error updating sweet quantity:', error);
    }
  };

  const addNewSweet = async () => {
    try {
      const sweetData = {
        ...newSweet,
        price: parseFloat(newSweet.price),
        quantity: parseInt(newSweet.quantity),
      };

      // Here you would make API call to add sweet
      // const response = await addSweetAPI(sweetData);
      
      // For now, add locally with mock ID
      const mockId = Date.now().toString();
      const addedSweet: Sweet = {
        id: mockId,
        name: sweetData.name,
        category: sweetData.category,
        price: sweetData.price.toString(),
        description: sweetData.description,
        quantity: sweetData.quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSweets(prev => [...prev, { ...addedSweet, selectedQuantity: 1 }]);
      
      // Reset form
      setNewSweet({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: ''
      });
      setIsAddingSweetMode(false);
    } catch (error) {
      console.error('Error adding sweet:', error);
    }
  };

  const handleCheckout = () => {
    // Scroll to checkout section
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handlePayment = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    
    // Process payment - items are now sold, so we don't return them to stock
    alert('Payment successful! Thank you for your purchase.');
    
    // Clear cart completely from both state and localStorage
    setCart([]);
    clearCartFromStorage();
    setIsCheckoutOpen(false);
    
    // Reset form data
    setFormData({
      fullName: '',
      email: user?.email || '',
      address: '',
      city: '',
      pinCode: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    setFormErrors({});
    
    // Refresh sweet data to ensure consistency
    fetchSweets();
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold sweet-gradient bg-clip-text text-transparent">
                Mithai Shop
              </h1>
            </div>

            {/* Right side - Cart, Auth */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <ShoppingBagIcon className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Auth Button - Mock Authentication */}
              {isSignedIn ? (
                <button 
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <button 
                  onClick={() => setShowSignInModal(true)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              )}

              {/* Admin Add Sweet Button */}
              {isAdmin && (
                <button
                  onClick={() => setIsAddingSweetMode(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add Sweet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cart Dropdown */}
        {isCartOpen && (
          <div className="absolute right-4 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">${item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.cartQuantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-500 hover:text-red-700 ml-2"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sign In Modal */}
        {showSignInModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Sign in to Sweet Shop</h3>
                <p className="text-gray-600">Choose your Google account to continue</p>
              </div>
              
              <div className="space-y-4">
                {/* Google Sign In Button */}
                <button
                  onClick={() => {
                    // Show Google OAuth page
                    setShowSignInModal(false);
                    setShowGoogleOAuth(true);
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                
                <button
                  onClick={() => setShowSignInModal(false)}
                  className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Add Sweet Modal */}
        {isAddingSweetMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Sweet</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newSweet.name}
                    onChange={(e) => setNewSweet({...newSweet, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newSweet.category}
                    onChange={(e) => setNewSweet({...newSweet, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSweet.price}
                    onChange={(e) => setNewSweet({...newSweet, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newSweet.quantity}
                    onChange={(e) => setNewSweet({...newSweet, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newSweet.description}
                    onChange={(e) => setNewSweet({...newSweet, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingSweetMode(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewSweet}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Add Sweet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sweets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sweets.map(sweet => (
            <div key={sweet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Sweet Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center overflow-hidden">
                {sweet.imageUrl ? (
                  <img 
                    src={getImageUrl(sweet.imageUrl)} 
                    alt={sweet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-4xl">🍮</span>
                )}
                {!sweet.imageUrl && (
                  <span className="text-4xl">�</span>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{sweet.name}</h3>
                  <span className="text-lg font-bold text-blue-600">₹{sweet.price}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{sweet.category}</p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{sweet.description}</p>
                
                {/* Admin Stock Controls */}
                {isAdmin && (
                  <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-700">Stock: {sweet.quantity}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateStockQuantity(sweet.id, -1)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStockQuantity(sweet.id, 1)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Cart Quantity Display (when item is in cart) */}
                {getCartQuantity(sweet.id) > 0 && (
                  <div className="flex items-center justify-center space-x-3 mb-3 p-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">In Cart:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItemQuantity(sweet.id, -1)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-green-700">
                        {getCartQuantity(sweet.id)}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(sweet.id, 1)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        disabled={getCartQuantity(sweet.id) >= sweet.quantity}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => addToCart(sweet)}
                  disabled={sweet.quantity === 0 || getCartQuantity(sweet.id) >= sweet.quantity}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    sweet.quantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : getCartQuantity(sweet.id) >= sweet.quantity
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {sweet.quantity === 0 
                    ? 'Not Available' 
                    : getCartQuantity(sweet.id) >= sweet.quantity
                    ? 'Max Quantity Added'
                    : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Section */}
        {isCheckoutOpen && (
          <div id="checkout-section" className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
              
              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 ml-2">x{item.cartQuantity}</span>
                      </div>
                      <span className="font-semibold">₹{(parseFloat(item.price) * item.cartQuantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3 text-lg font-bold border-t border-gray-300">
                    <span>Total:</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Payment Details</h3>
                
                {/* Billing Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Billing Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleFormChange('fullName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleFormChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={formData.pinCode}
                        onChange={(e) => handleFormChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.pinCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.pinCode && <p className="text-red-500 text-sm mt-1">{formErrors.pinCode}</p>}
                    </div>
                  </div>
                </div>

                {/* Card Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Card Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                          const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                          if (formattedValue.length <= 19) {
                            handleFormChange('cardNumber', formattedValue);
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          handleFormChange('expiryDate', value);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.expiryDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.expiryDate && <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleFormChange('cvv', value);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          formErrors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required
                      />
                      {formErrors.cvv && <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => {
                      // Return all cart items to stock when canceling checkout
                      cart.forEach(cartItem => {
                        const sweet = sweets.find(s => s.id === cartItem.id);
                        if (sweet) {
                          updateSweetStock(cartItem.id, sweet.quantity + cartItem.cartQuantity);
                        }
                      });
                      setCart([]);
                      setIsCheckoutOpen(false);
                    }}
                    className="flex-1 py-3 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-lg"
                  >
                    Pay ₹{getTotalPrice().toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showGoogleOAuth}
        onSignIn={(email: string) => {
          signIn(email);
          setShowGoogleOAuth(false);
        }}
        onClose={() => setShowGoogleOAuth(false)}
      />
    </div>
  );
};

export default SweetShopApp;