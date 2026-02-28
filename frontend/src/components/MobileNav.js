import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-secondary/80 backdrop-blur-lg border border-border/50 rounded-full p-4 shadow-lg flex justify-around items-center z-50">
      <Link to="/" data-testid="mobile-nav-home" className={`flex flex-col items-center gap-1 ${
        isActive('/') ? 'text-primary' : 'text-foreground'
      }`}>
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </Link>
      <Link to="/shop" data-testid="mobile-nav-shop" className={`flex flex-col items-center gap-1 ${
        isActive('/shop') ? 'text-primary' : 'text-foreground'
      }`}>
        <ShoppingBag className="h-5 w-5" />
        <span className="text-xs">Shop</span>
      </Link>
      <Link to="/wishlist" data-testid="mobile-nav-wishlist" className={`flex flex-col items-center gap-1 ${
        isActive('/wishlist') ? 'text-primary' : 'text-foreground'
      }`}>
        <Heart className="h-5 w-5" />
        <span className="text-xs">Wishlist</span>
      </Link>
      <Link to="/profile" data-testid="mobile-nav-profile" className={`flex flex-col items-center gap-1 ${
        isActive('/profile') ? 'text-primary' : 'text-foreground'
      }`}>
        <User className="h-5 w-5" />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  );
};