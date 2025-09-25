// frontend/src/pages/SweetShopPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sweet, CartItem } from '../types';
import { Navigation } from '../components/Navigation';
import { SweetCard } from '../components/SweetComponents';
import { Hero } from '../components/Hero';
import { CartSidebar } from '../components/CartSidebar';
import { AdminPanel } from '../components/AdminPanel';
import GoogleOAuthPage from '../components/GoogleOAuthPage';

const API_BASE_URL = 'http://localhost:3001';

const SweetShopPage: React.FC = () => {
  const { isSignedIn, user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.cartQuantity, 0);

  if (showGoogleOAuth) {
    return (
      <GoogleOAuthPage
        onSignIn={(email) => {
          signIn(email);
          setShowGoogleOAuth(false);
        }}
        onCancel={() => setShowGoogleOAuth(false)}
      />
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-brand-palace">Complete Collection</h2>
          <p className="mt-2 text-brand-palace/70">
            Explore our complete range of authentic Indian sweets
          </p>
        </div>

        {loading ? (
          <p>Loading sweets...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sweets.map(sweet => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onAddToCart={() => handleAddToCart(sweet)}
              />
            ))}
          </div>
        )}
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
    </div>
  );
};

export default SweetShopPage;