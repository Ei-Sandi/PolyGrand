import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Home, PlusCircle, User, LogOut, Wallet, Menu, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { account, isConnected, connect, disconnect } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Markets', href: '/markets', icon: TrendingUp },
    { name: 'Create Market', href: '/create', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-algorand to-algorand-dark rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">PolyGrand</span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">PG</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-algorand text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Wallet Connection - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {isConnected && account ? (
                <>
                  <div className="text-right hidden lg:block">
                    <div className="text-xs text-gray-500">Balance</div>
                    <div className="font-semibold text-gray-900">
                      {account.balance.toFixed(2)} ALGO
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
```                    <div className="text-sm text-gray-700 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </div>
                  </div>
                  <button
                    onClick={disconnect}
                    className="btn btn-secondary flex items-center space-x-2 text-sm"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden xl:inline">Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={connect}
                  className="btn btn-primary flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive(item.href)
                        ? 'bg-algorand text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Wallet Section */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {isConnected && account ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                      <div className="text-xs text-gray-500 mb-1">Wallet Address</div>
                      <div className="text-sm font-mono text-gray-700 mb-2">
                        {account.address.slice(0, 12)}...{account.address.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Balance</div>
                      <div className="font-semibold text-gray-900">
                        {account.balance.toFixed(2)} ALGO
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full btn btn-secondary flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      connect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn btn-primary flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              © 2025 PolyGrand. Built on Algorand.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-algorand transition-colors">Docs</a>
              <a href="#" className="text-sm text-gray-500 hover:text-algorand transition-colors">GitHub</a>
              <a href="#" className="text-sm text-gray-500 hover:text-algorand transition-colors">Discord</a>
              <a href="#" className="text-sm text-gray-500 hover:text-algorand transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
