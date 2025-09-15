import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Package,
  Users,
  Settings
} from 'lucide-react';

const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'seller':
        return '/seller';
      case 'retailer':
        return '/retailer';
      case 'admin':
        return '/admin';
      default:
        return null;
    }
  };

  const getDashboardIcon = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'seller':
        return <Package className="w-5 h-5" />;
      case 'retailer':
        return <ShoppingBag className="w-5 h-5" />;
      case 'admin':
        return <Users className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-text-primary">LocalB2B</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors ${
                  location === '/' ? 'text-primary-500' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className={`text-sm font-medium transition-colors ${
                  location === '/products' ? 'text-primary-500' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Products
              </Link>
            </nav>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href={getDashboardLink()} 
                    className="flex items-center space-x-2 text-sm font-medium text-text-primary hover:text-primary-500 transition-colors"
                  >
                    {getDashboardIcon()}
                    <span>Dashboard</span>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                      {user?.businessName || `${user?.firstName} ${user?.lastName}`}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-danger transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              <Link 
                href="/" 
                className="block text-sm font-medium text-text-secondary hover:text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="block text-sm font-medium text-text-secondary hover:text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href={getDashboardLink()} 
                    className="flex items-center space-x-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {getDashboardIcon()}
                    <span>Dashboard</span>
                  </Link>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">
                        {user?.businessName || `${user?.firstName} ${user?.lastName}`}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-sm font-medium text-text-secondary hover:text-danger"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link 
                    href="/login" 
                    className="block text-sm font-medium text-text-secondary hover:text-text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="block btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-primary-500" />
                <span className="text-lg font-bold text-text-primary">LocalB2B</span>
              </div>
              <p className="text-text-secondary text-sm">
                Connect with local B2B suppliers and discover quality products from businesses in your area.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-text-secondary hover:text-text-primary">Home</Link></li>
                <li><Link href="/products" className="text-sm text-text-secondary hover:text-text-primary">Products</Link></li>
                <li><Link href="/register" className="text-sm text-text-secondary hover:text-text-primary">Register</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-sm text-text-secondary">Email: support@localb2b.com</li>
                <li className="text-sm text-text-secondary">Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-text-secondary">
              © 2024 LocalB2B. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
