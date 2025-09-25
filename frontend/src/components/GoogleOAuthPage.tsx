import React, { useState, useEffect } from 'react';

interface GoogleOAuthPageProps {
  onSignIn: (email: string) => void;
  onCancel: () => void;
}

const GoogleOAuthPage: React.FC<GoogleOAuthPageProps> = ({ onSignIn, onCancel }) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [hoveredAccount, setHoveredAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  // Animate accounts in on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowAccounts(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced mock Google accounts with better colors and data
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-500 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 -right-8 w-64 h-64 bg-yellow-300 opacity-20 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-pink-300 opacity-15 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute bottom-8 right-1/4 w-32 h-32 bg-green-300 opacity-25 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
        
        {/* Floating Sweet Icons */}
        <div className="absolute top-16 left-16 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍬</div>
        <div className="absolute top-32 right-20 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🧁</div>
        <div className="absolute bottom-32 left-20 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🍭</div>
        <div className="absolute bottom-16 right-16 text-3xl animate-bounce" style={{ animationDelay: '2s' }}>🍰</div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:scale-105">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Signing you in...</p>
                <div className="flex justify-center mt-2 space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          {/* Enhanced Header with Animation */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6 transform transition-all duration-500 hover:scale-110">
              <div className="relative">
                <svg className="w-12 h-12 mr-3 animate-pulse" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 animate-ping"></div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <span className="text-2xl font-bold">Sign in with Google</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome to Sweet Shop! 🍬
              </h2>
              <p className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                Choose your account to continue
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>

          {/* Enhanced Account Selection with Animations */}
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
                  className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden ${
                    selectedAccount === account.email
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : hoveredAccount === account.id
                      ? 'bg-gradient-to-r from-gray-50 to-blue-50 shadow-lg transform scale-102 border-2 border-purple-200'
                      : 'bg-white/80 hover:bg-white shadow-md border border-gray-200/50'
                  }`}
                >
                  {/* Hover Effect Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${account.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${account.bgColor} rounded-full flex items-center justify-center text-white font-medium mr-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <span className="text-lg">{account.avatar}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className={`text-sm font-bold truncate transition-colors duration-300 ${
                      selectedAccount === account.email ? 'text-white' : 'text-gray-900'
                    }`}>
                      {account.name}
                    </div>
                    <div className={`text-sm truncate transition-colors duration-300 ${
                      selectedAccount === account.email ? 'text-purple-100' : 'text-gray-600'
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
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        Signed out
                      </span>
                    )}
                    {account.status === 'active' && hoveredAccount === account.id && (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        ✓ Ready
                      </span>
                    )}
                  </div>

                  {/* Selection Animation */}
                  {selectedAccount === account.email && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Enhanced Footer with Gradients */}
          <div className="mt-8 pt-6 border-t border-gradient-to-r from-purple-200 to-pink-200">
            <div className="flex justify-between items-center">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="group flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Cancel</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-xs bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent font-medium">
                  English (United States) 🇺🇸
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="text-xs text-center">
                <p className="text-gray-600 mb-2">
                  🍬 Before entering our sweet paradise, you can review Sweet Shop's
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors duration-300">
                    🔒 Privacy Policy
                  </a>
                  <span className="text-gray-400">•</span>
                  <a href="#" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors duration-300">
                    📜 Terms of Service
                  </a>
                </div>
                <p className="mt-2 text-gray-500 text-xs">
                  Made with 💖 for sweet lovers everywhere
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Action Text */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm font-medium animate-pulse">
            ✨ Click an account above to enter the sweet shop! ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthPage;