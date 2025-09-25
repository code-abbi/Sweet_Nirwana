// frontend/src/components/InfoCards.tsx
import React, { useState, useEffect } from 'react';

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  highlight?: string;
  delay?: number;
}> = ({ icon, title, description, highlight, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 overflow-hidden border border-white/10 hover:border-white/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shine Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-orange transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          {description}
        </p>
        {highlight && (
          <div className="bg-gradient-to-r from-brand-orange/10 to-yellow-400/10 rounded-lg p-2 border-l-4 border-brand-orange">
            <span className="text-xs font-semibold text-brand-orange">{highlight}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProcessStep: React.FC<{
  step: number;
  title: string;
  description: string;
  icon: string;
}> = ({ step, title, description, icon }) => (
  <div className="flex items-start gap-4 group">
    <div className="relative flex-shrink-0">
      <div className="w-12 h-12 bg-gradient-to-r from-brand-orange to-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
        {step}
      </div>
      <div className="absolute -top-2 -right-2 text-lg">{icon}</div>
    </div>
    <div>
      <h4 className="font-bold text-white mb-1 group-hover:text-brand-orange transition-colors duration-300">
        {title}
      </h4>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  </div>
);

interface InfoCardsProps {
  onMixedBoxClick?: () => void;
}

export const InfoCards: React.FC<InfoCardsProps> = ({ onMixedBoxClick }) => {
  return (
    <>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(210, 105, 30, 0.3); }
          50% { border-color: rgba(210, 105, 30, 0.8); }
        }
        
        @keyframes slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .animate-pulse-border { animation: pulse-border 2s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
      `}</style>
      
      <section className="mb-16 space-y-16">
        {/* Why Choose Us Section */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
              <span className="text-2xl">💎</span>
              <span className="text-white font-semibold">Excellence in Every Bite</span>
            </div>
                        <h2 className="text-4xl font-bold text-white mb-4 text-center">
              Why Choose Sweet Nirvana?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Discover what makes us the premier destination for authentic Indian sweets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="🏆"
              title="Award Winning"
              description="Recognized as the best sweet shop for 5 consecutive years. Our commitment to quality has earned us numerous accolades."
              highlight="Winner: Best Traditional Sweets 2023"
              delay={0}
            />
            <FeatureCard
              icon="👨‍🍳"
              title="Master Craftsmen"
              description="Our halwais (sweet makers) have generations of experience, ensuring every sweet is made to perfection."
              highlight="75+ Years of Family Recipes"
              delay={150}
            />
            <FeatureCard
              icon="🌱"
              title="Pure Ingredients"
              description="We source only the finest ingredients - pure ghee, premium nuts, and organic milk from trusted farms."
              highlight="100% Natural & Fresh"
              delay={300}
            />
            <FeatureCard
              icon="🚚"
              title="Fresh Daily"
              description="Every sweet is prepared fresh daily in small batches to ensure maximum taste and quality."
              highlight="Same Day Delivery Available"
              delay={450}
            />
          </div>
        </div>

        {/* Our Process Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
              <span className="text-2xl">⚡</span>
              <span className="text-white font-semibold">From Kitchen to Your Door</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Sweet Making Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProcessStep
              step={1}
              icon="🛒"
              title="Ingredient Selection"
              description="We carefully select the finest ingredients from trusted suppliers every morning."
            />
            <ProcessStep
              step={2}
              icon="👨‍🍳"
              title="Traditional Cooking"
              description="Our master chefs prepare each sweet using time-honored recipes and techniques."
            />
            <ProcessStep
              step={3}
              icon="✅"
              title="Quality Check"
              description="Every batch undergoes rigorous quality testing to ensure perfection in taste and texture."
            />
            <ProcessStep
              step={4}
              icon="📦"
              title="Fresh Delivery"
              description="Sweets are carefully packed and delivered fresh to maintain their authentic taste."
            />
          </div>
        </div>

        {/* Special Services Section */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
              <span className="text-2xl">🎊</span>
              <span className="text-white font-semibold">Special Services</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Making Your Celebrations Sweet
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-4xl text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                  🎂
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                  ✨
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Custom Orders</h3>
              <p className="text-gray-300 mb-4">
                Special occasion? We create custom sweet boxes and arrangements for weddings, festivals, and celebrations.
              </p>
              <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-200 animate-pulse-border">
                <span className="text-sm font-semibold text-pink-600">💌 Minimum 24hr notice required</span>
              </div>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-4xl text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                  🏢
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                  💼
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Corporate Gifts</h3>
              <p className="text-gray-300 mb-4">
                Premium gift boxes perfect for corporate events, client appreciation, and employee celebrations.
              </p>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-200 animate-pulse-border">
                <span className="text-sm font-semibold text-green-600">🎁 Bulk discounts available</span>
              </div>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-4xl text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                  🚚
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                  ⚡
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Express Delivery</h3>
              <p className="text-gray-300 mb-4">
                Need sweets urgently? Our express delivery service ensures your order reaches you within 2 hours.
              </p>
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-200 animate-pulse-border">
                <span className="text-sm font-semibold text-blue-600">🏃‍♂️ Available in select areas</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};