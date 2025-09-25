/**
 * Sweet Nirvana - Main Shop Page Component
 * 
 * This is the main page of the Sweet Nirvana application that displays:
 * - Hero section with animated sweet icons
 * - Featured sweets showcase
 * - Full catalog of Indian and global sweets
 * - Shopping cart functionality
 * - Admin panel for inventory management
 * - Advanced gradient background with interactive particles
 * 
 * Features:
 * - Sweet filtering (All, Indian, Global)
 * - Cart management with localStorage persistence
 * - User authentication with Google OAuth
 * - Admin functionality for sweet management
 * - Responsive design with dark theme
 * - Interactive background animations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Sweet, CartItem } from '../types';
import { Navigation } from '../components/Navigation';
import { SweetCard } from '../components/SweetComponents';
import { Hero } from '../components/Hero';
import { FeaturedSweets } from '../components/FeaturedSweets';
import { InfoCards } from '../components/InfoCards';
import { Testimonials } from '../components/Testimonials';
import { CartSidebar } from '../components/CartSidebar';
import { AdminPanel } from '../components/AdminPanel';
import GoogleAuthModal from '../components/GoogleAuthModal';
import { Footer } from '../components/Footer';

// Backend API endpoint
const API_BASE_URL = 'http://localhost:3001';

/**
 * Main Sweet Shop Page Component
 */
const SweetShopPage: React.FC = () => {
  // Authentication and navigation hooks
  const { isSignedIn, user, signIn, signOut } = useAuth();
  // const navigate = useNavigate(); // Currently unused
  const { showToast } = useToast();
  
  // Main application state
  const [sweets, setSweets] = useState<Sweet[]>([]); // All sweets from database
  const [shuffledSweets, setShuffledSweets] = useState<Sweet[]>([]); // One-time shuffled sweets to maintain positions
  const [cart, setCart] = useState<CartItem[]>([]); // Shopping cart items
  const [displayStock, setDisplayStock] = useState<{[key: string]: number}>({}); // Display stock separate from actual
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [sweetFilter, setSweetFilter] = useState<'all' | 'indian' | 'global'>('all'); // Filter for sweet categories
  
  // UI state management
  const [isCartOpen, setIsCartOpen] = useState(false); // Cart sidebar visibility
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false); // Admin panel visibility
  const [showGoogleOAuth, setShowGoogleOAuth] = useState(false); // Google OAuth modal visibility
  
  // Check if current user has admin privileges
  const isAdmin = isSignedIn && !!user?.isAdmin;

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sweet_shop_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sweet_shop_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/sweets`);
      const data = await response.json();
      if (data.success) {
        setSweets(data.data);
        
        // Only shuffle when user logs in for the first time or sweets change
        if (isSignedIn && data.data.length > 0) {
          // Check if we already have shuffled sweets with the same IDs
          const currentIds = shuffledSweets.map(s => s.id).sort().join(',');
          const newIds = data.data.map((s: Sweet) => s.id).sort().join(',');
          
          if (currentIds !== newIds) {
            // Only reshuffle if the sweet collection has changed
            setShuffledSweets([...data.data].sort(() => Math.random() - 0.5));
          }
        } else if (!isSignedIn) {
          // Clear shuffled sweets when logged out
          setShuffledSweets([]);
        }
      }
    } catch (error) {
      console.error('Error fetching sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  // Shuffle sweets when user first signs in
  useEffect(() => {
    if (isSignedIn && sweets.length > 0 && shuffledSweets.length === 0) {
      setShuffledSweets([...sweets].sort(() => Math.random() - 0.5));
    }
  }, [isSignedIn, sweets, shuffledSweets.length]);

  // Sync display stock with actual stock and cart quantities
  useEffect(() => {
    if (sweets.length > 0) {
      const newDisplayStock: {[key: string]: number} = {};
      
      sweets.forEach(sweet => {
        const cartItem = cart.find(item => item.id === sweet.id);
        const cartQuantity = cartItem ? cartItem.cartQuantity : 0;
        newDisplayStock[sweet.id] = Math.max(0, sweet.quantity - cartQuantity);
      });
      
      setDisplayStock(newDisplayStock);
    }
  }, [sweets, cart]);

  const updateSweetStockOnServer = async (id: string, newQuantity: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/sweets/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Math.max(0, newQuantity) }),
      });
    } catch (error) {
      console.error('Error updating stock on server:', error);
    }
  };

  const handleAddToCart = (sweet: Sweet) => {
    if (!isSignedIn) {
      setShowGoogleOAuth(true);
      return;
    }

    // Get current available stock (actual stock - items in cart)
    const existingItem = cart.find(item => item.id === sweet.id);
    const currentCartQty = existingItem ? existingItem.cartQuantity : 0;
    const availableStock = sweet.quantity - currentCartQty;

    if (availableStock <= 0) {
      showToast('This item is out of stock.', 'warning');
      return;
    }

    // Update display stock to show immediate visual feedback
    setDisplayStock(prev => ({
      ...prev,
      [sweet.id]: sweet.quantity - (currentCartQty + 1)
    }));

    setCart(prevCart => {
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

  const handleUpdateCartQuantity = (sweetId: string, newQuantity: number) => {
    const sweetInStock = sweets.find(s => s.id === sweetId);
    
    if (newQuantity <= 0) {
      // Remove item from cart and restore display stock
      if (sweetInStock) {
        setDisplayStock(prev => ({
          ...prev,
          [sweetId]: sweetInStock.quantity
        }));
      }
      setCart(prevCart => prevCart.filter(item => item.id !== sweetId));
      return;
    }
    
    if (sweetInStock && newQuantity > sweetInStock.quantity) {
      showToast('Cannot add more than available stock.', 'warning');
      // Set quantity to maximum available
      const maxQuantity = sweetInStock.quantity;
      setCart(prevCart => prevCart.map(item =>
        item.id === sweetId
          ? { ...item, cartQuantity: maxQuantity }
          : item
      ));
      // Update display stock
      setDisplayStock(prev => ({
        ...prev,
        [sweetId]: 0 // No stock left if cart has max quantity
      }));
      return;
    }

    // Update cart quantity
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === sweetId ? { ...item, cartQuantity: newQuantity } : item
      )
    );

    // Update display stock to reflect new cart quantity
    if (sweetInStock) {
      setDisplayStock(prev => ({
        ...prev,
        [sweetId]: sweetInStock.quantity - newQuantity
      }));
    }
  };

  const handleRemoveFromCart = (sweetId: string) => {
    const itemToRemove = cart.find(item => item.id === sweetId);
    if (itemToRemove) {
      // Restore display stock when item is removed from cart
      const originalStock = sweets.find(s => s.id === sweetId)?.quantity ?? 0;
      setDisplayStock(prev => ({
        ...prev,
        [sweetId]: originalStock
      }));
      showToast(`${itemToRemove.name} removed from cart`, 'success');
    }
    setCart(prevCart => prevCart.filter(item => item.id !== sweetId));
  };

  /**
   * Handles cart closure and restores display stock if cart is closed without completing order
   */
  const handleCartClose = () => {
    // Restore display stock for all cart items when cart is closed
    cart.forEach(item => {
      const originalStock = sweets.find(s => s.id === item.id)?.quantity ?? 0;
      setDisplayStock(prev => ({
        ...prev,
        [item.id]: originalStock
      }));
    });
    
    setIsCartOpen(false);
  };

  // Admin functions
  const handleAddSweet = async (sweetData: Omit<Sweet, 'id'>): Promise<boolean> => {
    try {
      // Convert price to number for backend
      const backendData = {
        ...sweetData,
        price: parseFloat(sweetData.price)
      };
      
      const response = await fetch(`${API_BASE_URL}/api/sweets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      
      if (response.ok) {
        fetchSweets(); // Refresh the sweets list
        showToast(`${sweetData.name} added successfully!`, 'success');
        return true;
      } else {
        showToast(`Failed to add ${sweetData.name}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error adding sweet:', error);
      showToast('Network error while adding sweet', 'error');
      return false;
    }
  };

  const handleUpdateStock = async (sweetId: string, newQuantity: number): Promise<boolean> => {
    try {
      const sweetName = sweets.find(s => s.id === sweetId)?.name || 'Item';
      
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (response.ok) {
        // Update display stock immediately
        setDisplayStock(prev => ({
          ...prev,
          [sweetId]: newQuantity
        }));
        
        fetchSweets(); // Refresh the sweets list
        showToast(`${sweetName} stock updated to ${newQuantity} units`, 'success');
        return true;
      } else {
        showToast(`Failed to update ${sweetName} stock`, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast('Network error while updating stock', 'error');
      return false;
    }
  };

  const handleDeleteSweet = async (sweetId: string): Promise<boolean> => {
    try {
      const sweetName = sweets.find(s => s.id === sweetId)?.name || 'Item';
      
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from display stock
        setDisplayStock(prev => {
          const newStock = { ...prev };
          delete newStock[sweetId];
          return newStock;
        });
        
        fetchSweets(); // Refresh the sweets list
        showToast(`${sweetName} deleted successfully`, 'success');
        return true;
      } else {
        showToast(`Failed to delete ${sweetName}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting sweet:', error);
      showToast('Network error while deleting sweet', 'error');
      return false;
    }
  };
  
  const handleOrderComplete = async (orderData: any) => {
    try {
      showToast('Processing your order...', 'success');
      
      // Update stock quantities on the server after successful order
      const stockUpdatePromises = cart.map(item => {
        const sweet = sweets.find(s => s.id === item.id);
        if (sweet) {
          const newStock = Math.max(0, sweet.quantity - item.cartQuantity);
          return updateSweetStockOnServer(item.id, newStock);
        }
        return Promise.resolve();
      });
      
      await Promise.all(stockUpdatePromises);
      
      // Clear display stock state for ordered items
      const clearedDisplayStock = { ...displayStock };
      cart.forEach(item => {
        const sweet = sweets.find(s => s.id === item.id);
        if (sweet) {
          const newStock = Math.max(0, sweet.quantity - item.cartQuantity);
          clearedDisplayStock[item.id] = newStock;
        }
      });
      setDisplayStock(clearedDisplayStock);
      
      // Clear the cart after successful order
      setCart([]);
      setIsCartOpen(false);
      
      // Refresh sweets data to show updated stock from server
      await fetchSweets();
      
      showToast('🎉 Order completed successfully! Your sweets are on the way!', 'success');
      
    } catch (error) {
      console.error('Error updating stock after order:', error);
      showToast('Order was placed but there was an issue updating stock. Please contact support.', 'warning');
      
      // Even if there's an error, clear the cart to avoid confusion
      setCart([]);
      setIsCartOpen(false);
    }
  };

  const createMixedBox = () => {
    if (!isSignedIn) {
      setShowGoogleOAuth(true);
      return;
    }

    // Filter available sweets (in stock)
    const availableSweets = sweets.filter(sweet => sweet.quantity > 0);
    if (availableSweets.length < 7) {
      showToast('Not enough sweets available for Mixed Box. Please try again later.', 'warning');
      return;
    }

    // Shuffle and select random sweets
    const shuffled = [...availableSweets].sort(() => Math.random() - 0.5);
    const selectedSweets: CartItem[] = [];
    let totalCost = 0;
    const maxCost = 1200;

    for (const sweet of shuffled) {
      const price = parseFloat(sweet.price);
      if (totalCost + price <= maxCost && selectedSweets.length < 10) {
        selectedSweets.push({ ...sweet, cartQuantity: 1 });
        totalCost += price;
        if (selectedSweets.length >= 7 && totalCost >= 800) break; // Ensure at least 7 items and reasonable total
      }
    }

    if (selectedSweets.length >= 7) {
      // Replace current cart with mixed box
      setCart(selectedSweets);
      setIsCartOpen(true);
      showToast(`🎊 Mixed Box created! ${selectedSweets.length} delicious sweets for ₹${totalCost.toFixed(2)}`, 'success');
    } else {
      showToast('Unable to create Mixed Box at this time. Please try again later.', 'error');
    }
  };

  const createSampleBox = () => {
    if (!isSignedIn) {
      setShowGoogleOAuth(true);
      return;
    }

    // Filter available sweets (in stock)
    const availableSweets = sweets.filter(sweet => sweet.quantity > 0);
    if (availableSweets.length < 3) {
      showToast('Not enough sweets available for Sample Box. Please try again later.', 'warning');
      return;
    }

    // Randomize selection for different combinations each time
    const shuffledSweets = [...availableSweets].sort(() => Math.random() - 0.5);
    const selectedSweets: CartItem[] = [];
    let totalCost = 0;
    const maxCost = 550; // Increased price limit to ₹550
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    // Use random selection approach for variety
    while (selectedSweets.length < Math.min(6, availableSweets.length) && attempts < maxAttempts) {
      attempts++;
      const randomSweet = shuffledSweets[Math.floor(Math.random() * shuffledSweets.length)];
      const price = parseFloat(randomSweet.price);
      
      // Check if this sweet is already selected and if adding it would exceed budget
      const alreadySelected = selectedSweets.find(s => s.id === randomSweet.id);
      if (!alreadySelected && totalCost + price <= maxCost) {
        selectedSweets.push({ ...randomSweet, cartQuantity: 1 });
        totalCost += price;
        
        // Stop if we have good variety and reasonable cost
        if (selectedSweets.length >= 3 && totalCost >= 250) {
          // Randomly decide if we should add more or stop here
          if (Math.random() > 0.4) break;
        }
      }
    }

    if (selectedSweets.length >= 3) {
      // Replace current cart with sample box
      setCart(selectedSweets);
      setIsCartOpen(true);
      showToast(`🍬 Sample Box created! ${selectedSweets.length} sweet varieties for ₹${totalCost.toFixed(2)}`, 'success');
    } else {
      showToast('Unable to create Sample Box at this time. Please try again later.', 'error');
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.cartQuantity, 0);

  // Categorize sweets based on actual database categories
  const indianCategories = ['Bengali', 'Milk-based', 'Syrup-based', 'Flour-based', 'Dry Fruits', 'Fried', 'Milk-Rice based'];
  const globalCategories = ['European', 'Middle Eastern', 'French', 'American', 'Japanese', 'Spanish', 'Australian', 'Italian', 'Latin American'];

  const getFilteredSweets = () => {
    // Use shuffledSweets if available (for signed-in users), otherwise use regular sweets
    const sweetsToFilter = isSignedIn && shuffledSweets.length > 0 ? shuffledSweets : sweets;
    
    if (sweetFilter === 'indian') {
      return sweetsToFilter.filter(sweet => indianCategories.includes(sweet.category));
    } else if (sweetFilter === 'global') {
      return sweetsToFilter.filter(sweet => globalCategories.includes(sweet.category));
    }
    return sweetsToFilter; // 'all' case
  };

  const filteredSweets = getFilteredSweets();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Advanced Sweet-themed Gradient Background */}
      <div className="sweet-gradient-background fixed inset-0 z-0 overflow-hidden">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>
        
        {/* Large gradient spheres with sweet colors */}
        <div className="sweet-sphere sphere-1 absolute rounded-full blur-3xl" 
             style={{
               width: '40vw',
               height: '40vw',
               background: 'linear-gradient(40deg, rgba(255, 159, 64, 0.6), rgba(255, 206, 84, 0.3))',
               top: '-10%',
               left: '-10%',
               animation: 'sweetFloat1 15s ease-in-out infinite alternate'
             }}>
        </div>
        
        <div className="sweet-sphere sphere-2 absolute rounded-full blur-3xl"
             style={{
               width: '45vw', 
               height: '45vw',
               background: 'linear-gradient(240deg, rgba(255, 99, 71, 0.7), rgba(255, 140, 0, 0.4))',
               bottom: '-20%',
               right: '-10%',
               animation: 'sweetFloat2 18s ease-in-out infinite alternate'
             }}>
        </div>
        
        <div className="sweet-sphere sphere-3 absolute rounded-full blur-3xl"
             style={{
               width: '30vw',
               height: '30vw', 
               background: 'linear-gradient(120deg, rgba(255, 193, 7, 0.5), rgba(255, 235, 59, 0.3))',
               top: '60%',
               left: '20%',
               animation: 'sweetFloat3 20s ease-in-out infinite alternate'
             }}>
        </div>
        
        <div className="sweet-sphere sphere-4 absolute rounded-full blur-2xl"
             style={{
               width: '25vw',
               height: '25vw',
               background: 'linear-gradient(200deg, rgba(255, 183, 77, 0.4), rgba(255, 87, 34, 0.2))',
               top: '10%',
               right: '30%',
               animation: 'sweetFloat4 22s ease-in-out infinite alternate'
             }}>
        </div>
        
        {/* Central glow effect */}
        <div className="sweet-glow absolute rounded-full blur-3xl"
             style={{
               width: '35vw',
               height: '35vh',
               background: 'radial-gradient(circle, rgba(255, 206, 84, 0.15), transparent 70%)',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               animation: 'sweetPulse 8s infinite alternate'
             }}>
        </div>
        
        {/* Sweet-themed grid overlay */}
        <div className="sweet-grid absolute inset-0"
             style={{
               backgroundSize: '40px 40px',
               backgroundImage: `
                 linear-gradient(to right, rgba(255, 206, 84, 0.05) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(255, 206, 84, 0.05) 1px, transparent 1px)
               `,
               zIndex: 2
             }}>
        </div>
        
        {/* Noise overlay for texture */}
        <div className="sweet-noise absolute inset-0 opacity-5"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               zIndex: 5
             }}>
        </div>
        
        {/* Floating sweet particles */}
        <div id="sweet-particles-container" className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {/* Dynamic particles will be created here */}
        </div>
        
        {/* Main dark overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-slate-900/80 to-gray-800/85" style={{ zIndex: 6 }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navigation
        isSignedIn={isSignedIn}
        isAdmin={isAdmin}
        userEmail={user?.email}
        userName={user?.name}
        totalItems={totalItems}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onSignOut={signOut}
        onSignIn={() => setShowGoogleOAuth(true)}
        onAdminPanel={isAdmin ? () => setIsAdminPanelOpen(true) : undefined}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={handleCartClose}
        cartItems={cart}
        totalPrice={totalPrice}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        userEmail={user?.email}
        onOrderComplete={handleOrderComplete}
      />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Hero 
            isSignedIn={isSignedIn} 
            onSignIn={() => setShowGoogleOAuth(true)} 
          />
        </section>

        {/* Featured Sweets Section */}
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedSweets 
            sweets={sweets} 
            onAddToCart={handleAddToCart}
            onMixedBoxClick={createMixedBox}
          />
        </section>

        {/* Info Cards Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InfoCards onMixedBoxClick={createMixedBox} />
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials 
            isSignedIn={isSignedIn}
            onSignIn={() => setShowGoogleOAuth(true)}
          />
        </section>

        {/* Complete Collection Section */}
        <section id="complete-collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-2xl">🍭</span>
              <span className="text-white font-semibold">Complete Collection</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Explore All Our Sweets
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-8">
              From traditional classics to global innovations, discover our complete range of authentic desserts
            </p>
            
            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setSweetFilter('all')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  sweetFilter === 'all'
                    ? 'bg-gradient-to-r from-brand-orange to-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:scale-105'
                }`}
              >
                🌍 All Sweets ({sweets.length})
              </button>
              <button
                onClick={() => setSweetFilter('indian')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  sweetFilter === 'indian'
                    ? 'bg-gradient-to-r from-brand-orange to-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:scale-105'
                }`}
              >
                🇮🇳 Indian Classics ({sweets.filter(s => indianCategories.includes(s.category)).length})
              </button>
              <button
                onClick={() => setSweetFilter('global')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  sweetFilter === 'global'
                    ? 'bg-gradient-to-r from-brand-orange to-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:scale-105'
                }`}
              >
                🌎 Global Delights ({sweets.filter(s => globalCategories.includes(s.category)).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-orange border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Loading delicious sweets...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredSweets.map((sweet, index) => (
                <div
                  key={sweet.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SweetCard
                    sweet={sweet}
                    displayStock={displayStock[sweet.id]}
                    onAddToCart={() => handleAddToCart(sweet)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA Section */}
          {sweets.length > 0 && (
            <div className="text-center mt-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Can't decide? Try our Sweet Sampler Box! 🎁
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Get a taste of our delicious sweets with our randomly curated sampler box. 
                  Different selection every time - Perfect for discovery or as a gift!
                </p>
                <button 
                  onClick={createSampleBox}
                  className="bg-gradient-to-r from-brand-orange to-yellow-500 hover:from-yellow-500 hover:to-brand-orange text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Order Sample Box 🍬
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Add custom animations */}
        <style>{`
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateX(0) translateY(0) rotate(0deg);
            }
            33% {
              transform: translateX(10px) translateY(-10px) rotate(1deg);
            }
            66% {
              transform: translateX(-5px) translateY(5px) rotate(-1deg);
            }
          }
          
          /* Sweet gradient sphere animations */
          @keyframes sweetFloat1 {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.6;
            }
            100% {
              transform: translate(8%, 12%) scale(1.15);
              opacity: 0.8;
            }
          }
          
          @keyframes sweetFloat2 {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.7;
            }
            100% {
              transform: translate(-12%, -8%) scale(1.2);
              opacity: 0.9;
            }
          }
          
          @keyframes sweetFloat3 {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.5;
            }
            100% {
              transform: translate(-8%, 15%) scale(1.1);
              opacity: 0.7;
            }
          }
          
          @keyframes sweetFloat4 {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.4;
            }
            100% {
              transform: translate(10%, -10%) scale(1.05);
              opacity: 0.6;
            }
          }
          
          @keyframes sweetPulse {
            0% {
              opacity: 0.15;
              transform: translate(-50%, -50%) scale(0.9);
            }
            100% {
              opacity: 0.25;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          
          @keyframes sweetParticleFloat {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes sweetSparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0;
          }
          
          .sweet-particle {
            position: absolute;
            background: radial-gradient(circle, rgba(255, 206, 84, 0.8), transparent);
            border-radius: 50%;
            pointer-events: none;
            animation: sweetParticleFloat 15s linear infinite;
          }
          
          .sweet-sparkle {
            position: absolute;
            background: radial-gradient(circle, rgba(255, 235, 59, 0.9), rgba(255, 193, 7, 0.3));
            border-radius: 50%;
            pointer-events: none;
            animation: sweetSparkle 3s ease-in-out infinite;
          }
        `}</style>
        
        {/* Sweet Particles Interactive Script */}
        <script dangerouslySetInnerHTML={{__html: `
          // Sweet-themed particle system
          document.addEventListener('DOMContentLoaded', function() {
            const particlesContainer = document.getElementById('sweet-particles-container');
            if (!particlesContainer) return;
            
            const particleCount = 60;
            
            // Create floating particles
            for (let i = 0; i < particleCount; i++) {
              createSweetParticle();
            }
            
            function createSweetParticle() {
              const particle = document.createElement('div');
              particle.className = 'sweet-particle';
              
              // Random size (small sweet particles)
              const size = Math.random() * 4 + 2;
              particle.style.width = size + 'px';
              particle.style.height = size + 'px';
              
              // Initial position
              resetParticle(particle);
              
              particlesContainer.appendChild(particle);
              
              // Animate
              animateParticle(particle);
            }
            
            function resetParticle(particle) {
              const posX = Math.random() * 100;
              const posY = 110; // Start below viewport
              
              particle.style.left = posX + '%';
              particle.style.top = posY + '%';
              particle.style.opacity = '0';
              
              return { x: posX, y: posY };
            }
            
            function animateParticle(particle) {
              const pos = resetParticle(particle);
              
              // Random animation properties
              const duration = Math.random() * 12 + 8;
              const delay = Math.random() * 5;
              
              setTimeout(() => {
                particle.style.transition = 'all ' + duration + 's linear';
                particle.style.opacity = (Math.random() * 0.4 + 0.2).toString();
                
                // Move upwards with slight horizontal drift
                const moveX = pos.x + (Math.random() * 15 - 7.5);
                const moveY = -10; // Move upwards off screen
                
                particle.style.left = moveX + '%';
                particle.style.top = moveY + '%';
                
                // Reset after animation completes
                setTimeout(() => {
                  animateParticle(particle);
                }, duration * 1000);
              }, delay * 1000);
            }
            
            // Mouse interaction for sweet sparkles
            let mouseTimeout;
            document.addEventListener('mousemove', function(e) {
              clearTimeout(mouseTimeout);
              
              // Throttle mouse events
              mouseTimeout = setTimeout(() => {
                createMouseSparkle(e);
                moveGradientSpheres(e);
              }, 50);
            });
            
            function createMouseSparkle(e) {
              const mouseX = (e.clientX / window.innerWidth) * 100;
              const mouseY = (e.clientY / window.innerHeight) * 100;
              
              // Create temporary sparkle
              const sparkle = document.createElement('div');
              sparkle.className = 'sweet-sparkle';
              
              // Small sparkle size
              const size = Math.random() * 6 + 3;
              sparkle.style.width = size + 'px';
              sparkle.style.height = size + 'px';
              
              // Position at mouse
              sparkle.style.left = mouseX + '%';
              sparkle.style.top = mouseY + '%';
              
              particlesContainer.appendChild(sparkle);
              
              // Remove after animation
              setTimeout(() => {
                sparkle.remove();
              }, 3000);
            }
            
            function moveGradientSpheres(e) {
              const moveX = (e.clientX / window.innerWidth - 0.5) * 8;
              const moveY = (e.clientY / window.innerHeight - 0.5) * 8;
              
              const spheres = document.querySelectorAll('.sweet-sphere');
              spheres.forEach((sphere, index) => {
                const intensity = (index + 1) * 0.3;
                const currentTransform = sphere.style.transform || '';
                const newTransform = 'translate(' + (moveX * intensity) + 'px, ' + (moveY * intensity) + 'px)';
                
                sphere.style.transition = 'transform 0.3s ease-out';
                if (currentTransform.includes('scale')) {
                  sphere.style.transform = newTransform + ' ' + currentTransform.split('translate')[0];
                } else {
                  sphere.style.transform = newTransform;
                }
              });
            }
          });
        `}} />

        {/* Footer */}
        <Footer />
      </main>

      {/* Admin Panel */}
      {isAdminPanelOpen && (
        <AdminPanel
          sweets={sweets}
          onAddSweet={handleAddSweet}
          onUpdateStock={handleUpdateStock}
          onDeleteSweet={handleDeleteSweet}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

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
    </div>
  );
};

export default SweetShopPage;