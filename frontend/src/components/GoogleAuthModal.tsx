// frontend/src/components/GoogleAuthModal.tsx
import React, { useState, useEffect } from 'react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onSignIn: (email: string) => void;
  onClose: () => void;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onSignIn, onClose }) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [hoveredAccount, setHoveredAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAccounts(false);
      setSelectedAccount('');
      setHoveredAccount('');
      setIsLoading(false);
      const timer = setTimeout(() => setShowAccounts(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Enhanced mock Google accounts
  const mockGoogleAccounts = [
    {
      id: '1',
      name: 'Abbi Tomar',
      email: 'tomar.abhi2018@gmail.com',
      avatar: '🧑‍💼',
      bgColor: 'from-blue-400 to-purple-500',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Abi tomar',
      email: 'abittomar001@gmail.com',
      avatar: '👨‍💻',
      bgColor: 'from-green-400 to-blue-500',
      status: 'active'
    },
    {
      id: '3',
      name: 'wild raBit',
      email: 'wildrabit001@gmail.com',
      avatar: '🦸‍♂️',
      bgColor: 'from-purple-400 to-pink-500',
      status: 'admin'
    },
    {
      id: '4',
      name: 'Abhishek Tomar',
      email: 'atomar003.mca2023@cca.nittr.ac.in',
      avatar: '👨‍🎓',
      bgColor: 'from-yellow-400 to-orange-500',
      status: 'signed-out'
    },
    {
      id: '5',
      name: 'one last',
      email: 'lto3.fake@gmail.com',
      avatar: '⭕',
      bgColor: 'from-red-400 to-pink-500',
      status: 'active'
    }
  ];

  const handleAccountSelect = async (email: string) => {
    setIsLoading(true);
    setSelectedAccount(email);
    
    // Add loading animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSignIn(email);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800/95 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent mx-auto mb-4"></div>
              <p className="text-white font-medium">Signing you in...</p>
              <div className="flex justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-brand-orange to-yellow-500 rounded-full mr-3">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Sign in with Google</h3>
                <p className="text-sm text-gray-300">Choose your account to continue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Account Selection */}
        <div className="p-6">
          <div className="space-y-3">
            {mockGoogleAccounts.map((account, index) => (
              <div
                key={account.id}
                className={`transform transition-all duration-500 ${
                  showAccounts 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => handleAccountSelect(account.email)}
                  onMouseEnter={() => setHoveredAccount(account.id)}
                  onMouseLeave={() => setHoveredAccount('')}
                  disabled={isLoading}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                    selectedAccount === account.email
                      ? `bg-gradient-to-r ${account.bgColor} border-transparent text-white shadow-lg`
                      : hoveredAccount === account.id
                      ? 'border-white/30 bg-white/10 shadow-md'
                      : 'border-white/20 hover:border-white/30 hover:shadow-sm hover:bg-white/5'
                  }`}
                >
                  {/* Background Gradient Animation */}
                  {selectedAccount === account.email && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${account.bgColor} opacity-90`}></div>
                  )}
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-4 relative z-10">
                    <span className="text-lg">{account.avatar}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className={`text-sm font-bold truncate transition-colors duration-300 ${
                      selectedAccount === account.email ? 'text-white' : 'text-white'
                    }`}>
                      {account.name}
                    </div>
                    <div className={`text-sm truncate transition-colors duration-300 ${
                      selectedAccount === account.email ? 'text-white/80' : 'text-gray-300'
                    }`}>
                      {account.email}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex-shrink-0 ml-2">
                    {account.status === 'admin' && (
                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-semibold shadow-md">
                        👑 Admin
                      </span>
                    )}
                    {account.status === 'signed-out' && (
                      <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full font-medium border border-white/20">
                        Signed out
                      </span>
                    )}
                    {account.status === 'active' && hoveredAccount === account.id && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-medium border border-green-500/30">
                        ✓ Ready
                      </span>
                    )}
                  </div>

                  {/* Selection Animation */}
                  {selectedAccount === account.email && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-brand-orange rounded-full animate-ping"></div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>


        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Secure sign-in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;