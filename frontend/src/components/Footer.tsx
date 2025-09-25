import React from 'react';
import { HeartIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/95 backdrop-blur-sm border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🍬</span>
              <h3 className="text-xl font-bold text-white">Sweet Nirvana</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Crafting authentic Indian sweets and global delights with love and tradition. 
              Every bite tells a story of heritage, quality, and sweetness.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#featured" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Featured Sweets
                </a> 
              </li>
              <li>
                <a href="#explore" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Explore Collection
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-300 hover:text-brand-orange transition-colors text-sm">
                  Customer Reviews
                </a>
              </li>
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-300 hover:text-brand-orange transition-colors text-sm"
                >
                  Back to Top
                </button>
              </li>
            </ul>
          </div>

          {/* Sweet Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Sweet Categories</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-lg">🇮🇳</span>
                <span className="text-gray-300 text-sm">Indian Classics</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">🌎</span>
                <span className="text-gray-300 text-sm">Global Delights</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">🥛</span>
                <span className="text-gray-300 text-sm">Milk-based Sweets</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">🍯</span>
                <span className="text-gray-300 text-sm">Syrup Delicacies</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lg">🥜</span>
                <span className="text-gray-300 text-sm">Dry Fruit Specials</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-4 h-4 text-brand-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">123 Sweet Street</p>
                  <p className="text-gray-300 text-sm">Confectionery District</p>
                  <p className="text-gray-300 text-sm">Delhi, India 110001</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span className="text-gray-300 text-sm">hello@sweetnirvana.com</span>
              </div>

              {/* Social Links */}
              <div className="pt-2">
                <p className="text-gray-300 text-sm mb-2">Follow us:</p>
                <div className="flex space-x-3">
                  <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange/20 transition-colors">
                    <span className="text-sm">📘</span>
                  </button>
                  <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange/20 transition-colors">
                    <span className="text-sm">📷</span>
                  </button>
                  <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange/20 transition-colors">
                    <span className="text-sm">🐦</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} Sweet Nirvana. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-gray-400">
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};