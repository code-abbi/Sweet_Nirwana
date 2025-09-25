// frontend/src/pages/SweetShopPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

const API_BASE_URL = 'http://localhost:3001';

const SweetShopPage: React.FC = () => {
  const { isSignedIn, user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sweetFilter, setSweetFilter] = useState<'all' | 'indian' | 'global'>('all');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [showGoogleOAuth, setShowGoogleOAuth] = useState(false);
  
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

    const sweetInStock = sweets.find(s => s.id === sweet.id);
    if (!sweetInStock || sweetInStock.quantity <= 0) return;

    const existingItem = cart.find(item => item.id === sweet.id);
    const currentCartQty = existingItem ? existingItem.cartQuantity : 0;

    if (currentCartQty >= sweetInStock.quantity) {
      alert('Cannot add more than available stock.');
      return;
    }

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
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== sweetId));
      return;
    }
    
    const sweetInStock = sweets.find(s => s.id === sweetId);
    if (sweetInStock && newQuantity > sweetInStock.quantity) {
      alert('Cannot add more than available stock.');
      setCart(prevCart => prevCart.map(item =>
        item.id === sweetId
          ? { ...item, cartQuantity: sweetInStock.quantity }
          : item
      ));
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === sweetId ? { ...item, cartQuantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (sweetId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== sweetId));
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
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding sweet:', error);
      return false;
    }
  };

  const handleUpdateStock = async (sweetId: string, newQuantity: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (response.ok) {
        fetchSweets(); // Refresh the sweets list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  };

  const handleDeleteSweet = async (sweetId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sweets/${sweetId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchSweets(); // Refresh the sweets list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting sweet:', error);
      return false;
    }
  };
  
  const handleOrderComplete = async (orderData: any) => {
    // Update stock quantities on the server after successful order
    const stockUpdatePromises = cart.map(item => {
      const sweet = sweets.find(s => s.id === item.id);
      if (sweet) {
        return updateSweetStockOnServer(item.id, sweet.quantity - item.cartQuantity);
      }
      return Promise.resolve();
    });
    
    try {
      await Promise.all(stockUpdatePromises);
      
      // Clear the cart after successful order
      setCart([]);
      setIsCartOpen(false);
      
      // Refresh sweets to show updated stock
      fetchSweets();
      
      console.log('Order completed:', orderData);
    } catch (error) {
      console.error('Error updating stock after order:', error);
      alert('Order was placed but there was an issue updating stock. Please contact support.');
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
      alert('Not enough sweets available for Mixed Box. Please try again later.');
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
      alert(`🎊 Mixed Box created! ${selectedSweets.length} delicious sweets for ₹${totalCost.toFixed(2)}`);
    } else {
      alert('Unable to create Mixed Box at this time. Please try again later.');
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
      alert('Not enough sweets available for Sample Box. Please try again later.');
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
      alert(`🍬 Sample Box created! ${selectedSweets.length} sweet varieties for ₹${totalCost.toFixed(2)}`);
    } else {
      alert('Unable to create Sample Box at this time. Please try again later.');
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.cartQuantity, 0);

  // Categorize sweets based on actual database categories
  const indianCategories = ['Bengali', 'Milk-based', 'Syrup-based', 'Flour-based', 'Dry Fruits', 'Fried', 'Milk-Rice based'];
  const globalCategories = ['European', 'Middle Eastern', 'French', 'American', 'Japanese', 'Spanish', 'Australian', 'Italian', 'Latin American'];

  const getFilteredSweets = () => {
    if (sweetFilter === 'indian') {
      return sweets.filter(sweet => indianCategories.includes(sweet.category));
    } else if (sweetFilter === 'global') {
      return sweets.filter(sweet => globalCategories.includes(sweet.category));
    }
    return sweets; // 'all' case
  };

  const filteredSweets = getFilteredSweets();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 min-h-screen relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
      <Navigation
        isSignedIn={isSignedIn}
        isAdmin={isAdmin}
        totalItems={totalItems}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onSignOut={signOut}
        onSignIn={() => setShowGoogleOAuth(true)}
        onAdminPanel={isAdmin ? () => setIsAdminPanelOpen(true) : undefined}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {[...filteredSweets].sort(() => Math.random() - 0.5).map((sweet, index) => (
                <div
                  key={sweet.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SweetCard
                    sweet={sweet}
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
                  Order Sampler Box - Up to ₹550 🍬
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
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>
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