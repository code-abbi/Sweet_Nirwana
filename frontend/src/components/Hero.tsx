// frontend/src/components/Hero.tsx
import React, { useState, useEffect } from 'react';

const InfoChip: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <div 
    className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-brand-palace shadow-sm 
               hover:bg-white/90 hover:scale-105 transition-all duration-300 cursor-pointer animate-bounce-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const FloatingSweet: React.FC<{ emoji: string; delay: number; position: string }> = ({ emoji, delay, position }) => (
  <div 
    className={`absolute ${position} text-4xl animate-float opacity-70 hover:opacity-100 hover:scale-125 transition-all duration-300 cursor-pointer`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {emoji}
  </div>
);

const Counter: React.FC<{ end: number; label: string; prefix?: string; suffix?: string }> = ({ 
  end, 
  label, 
  prefix = "", 
  suffix = "" 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < end) {
          return Math.min(prev + Math.ceil(end / 50), end);
        }
        clearInterval(timer);
        return end;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-brand-orange">
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm text-brand-palace/70 font-medium">{label}</div>
    </div>
  );
};

interface HeroProps {
  isSignedIn?: boolean;
  onSignIn?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ isSignedIn = false, onSignIn }) => {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  
  const scrollToSweetsSection = () => {
    const sweetsSection = document.getElementById('complete-collection');
    if (sweetsSection) {
      sweetsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderNow = () => {
    if (!isSignedIn) {
      onSignIn?.();
    } else {
      scrollToSweetsSection();
    }
  };
  const slogans = [
    "Experience the taste of tradition in every bite",
    "Premium quality sweets made with love and care",
    "Where ancient recipes meet modern perfection",
    "Sweetening lives since 1947"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan(prev => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slogans.length]);

  return (
    <>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3) translateY(50px); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-2deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(210, 105, 30, 0.3); }
          50% { box-shadow: 0 0 40px rgba(210, 105, 30, 0.6); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-bounce-in { animation: bounce-in 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-gradient { 
          background: linear-gradient(-45deg, #8B4513, #D2691E, #CD853F, #A0522D);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
      
      <div className="relative bg-gradient-to-br from-brand-bg-light via-yellow-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden mb-12 min-h-[600px]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero-background.jpg"
            alt="Assortment of Indian sweets"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg-light/90 via-yellow-50/70 to-orange-50/50"></div>
          
          {/* Floating Sweet Emojis */}
          <FloatingSweet emoji="🍬" delay={0} position="top-10 left-10" />
          <FloatingSweet emoji="🧁" delay={1000} position="top-20 right-16" />
          <FloatingSweet emoji="🍭" delay={2000} position="top-32 left-1/4" />
          <FloatingSweet emoji="🍰" delay={1500} position="top-40 right-1/3" />
          <FloatingSweet emoji="🎂" delay={500} position="bottom-20 left-20" />
          <FloatingSweet emoji="🍪" delay={2500} position="bottom-32 right-20" />
        </div>

        <div className="relative z-10 p-8 md:p-12">
          {/* Top Badges */}
          <div className="flex justify-center items-center gap-3 mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-glow">
              ✨ Premium Quality Since 1947
            </span>
            <span className="bg-white/90 backdrop-blur-sm text-brand-palace text-xs font-bold px-4 py-2 rounded-full shadow-md">
              ⭐ 4.9/5 Customer Rating
            </span>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              {/* Decorative Elements */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>✨</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🏰</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '1s' }}>✨</span>
              </div>
              
              {/* Enhanced Title */}
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 leading-tight">
                  Mithai Palace
                </h1>
                <span className="absolute -top-4 -right-4 text-3xl animate-pulse">👑</span>
                <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60"></div>
              </div>
              
              {/* Decorative underline */}
              <div className="flex justify-center items-center mt-2 gap-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-orange-400"></div>
                <span className="text-orange-500 text-xl">🕌</span>
                <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-orange-400"></div>
              </div>
            </div>
            
            <div className="mt-4 text-xl text-brand-palace/70 font-medium italic">
              "Where Tradition Meets Sweet Perfection"
            </div>
          </div>

          {/* Dynamic Slogan */}
          <div className="text-center mb-10">
            <div className="h-16 flex items-center justify-center">
              <p className="text-xl md:text-2xl text-brand-palace/80 font-medium max-w-3xl mx-auto transition-all duration-1000 transform">
                {slogans[currentSlogan]}
              </p>
            </div>
          </div>

          {/* Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Counter end={75} suffix="+" label="Years of Excellence" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Counter end={50} suffix="+" label="Sweet Varieties" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Counter end={10000} suffix="+" label="Happy Customers" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Counter end={99} suffix="%" label="Pure Ingredients" />
            </div>
          </div>

          {/* Feature Chips */}
          <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
            <InfoChip delay={100}>🌱 100% Natural</InfoChip>
            <InfoChip delay={200}>👨‍🍳 Master Chefs</InfoChip>
            <InfoChip delay={300}>🚚 Fresh Daily Delivery</InfoChip>
            <InfoChip delay={400}>🏆 Award Winning</InfoChip>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button 
                onClick={scrollToSweetsSection}
                className="bg-gradient-to-r from-brand-orange to-yellow-500 hover:from-yellow-500 hover:to-brand-orange text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-glow"
              >
                🛒 Explore Our Sweets
              </button>
              <button 
                onClick={handleOrderNow}
                className="bg-white/90 backdrop-blur-sm text-brand-palace font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-white transform hover:-translate-y-1 transition-all duration-300 border-2 border-brand-orange/20 hover:border-brand-orange/40"
              >
                📱 Order Now
              </button>
            </div>
            
            <div className="mt-4 text-sm text-brand-palace/60">
              🎉 Free delivery on orders above ₹500 | 🕐 Same day delivery available
            </div>
          </div>
        </div>
      </div>
    </>
  );
};