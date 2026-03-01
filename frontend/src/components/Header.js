import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-heading text-2xl md:text-3xl font-light tracking-tight text-primary">
            Slow Fashion Society
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/shop" data-testid="nav-shop" className="text-sm font-medium hover:text-primary transition-colors">
              Shop
            </Link>
            <Link to="/new-arrivals" data-testid="nav-new-arrivals" className="text-sm font-medium hover:text-primary transition-colors">
              New Arrivals
            </Link>
            <Link to="/gen-z" data-testid="nav-genz" className="text-sm font-medium hover:text-primary transition-colors">
              Gen Z
            </Link>
            <Link to="/about" data-testid="nav-about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/support" data-testid="nav-support" className="text-sm font-medium hover:text-primary transition-colors">
              Support
            </Link>
            {user && (
              <Link to="/admin" data-testid="nav-admin" className="text-sm font-medium hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/shop')} data-testid="search-button" className="hidden md:block hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
            {user ? (
              <>
                <button onClick={() => navigate('/wishlist')} data-testid="wishlist-button" className="hidden md:block hover:text-primary transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button onClick={() => navigate('/cart')} data-testid="cart-button" className="hover:text-primary transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                </button>
                <button onClick={() => navigate('/profile')} data-testid="profile-button" className="hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} data-testid="login-button" className="rounded-full">
                Sign In
              </Button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-button" className="md:hidden">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                Shop
              </Link>
              <Link to="/new-arrivals" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                New Arrivals
              </Link>
              <Link to="/gen-z" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                Gen Z
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                Support
              </Link>
              {user && (
                <>
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                    Wishlist
                  </Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                    My Orders
                  </Link>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary transition-colors">
                    Admin
                  </Link>
                  <button onClick={handleLogout} data-testid="logout-button" className="text-sm font-medium hover:text-primary transition-colors text-left">
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};