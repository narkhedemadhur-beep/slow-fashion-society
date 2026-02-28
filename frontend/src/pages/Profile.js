import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-12" data-testid="profile-title">
          My Profile
        </h1>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-border/50 mb-8">
          <div className="flex items-center gap-6 mb-6">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-heading text-2xl font-medium" data-testid="profile-name">{user.name}</h2>
              <p className="text-muted-foreground" data-testid="profile-email">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/orders')}
            data-testid="my-orders-link"
            className="bg-white rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow text-left"
          >
            <Package className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-heading text-xl font-medium mb-1">My Orders</h3>
            <p className="text-sm text-muted-foreground">View your order history</p>
          </button>

          <button
            onClick={() => navigate('/wishlist')}
            data-testid="my-wishlist-link"
            className="bg-white rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow text-left"
          >
            <Heart className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-heading text-xl font-medium mb-1">My Wishlist</h3>
            <p className="text-sm text-muted-foreground">View saved items</p>
          </button>
        </div>

        <Button
          onClick={handleLogout}
          data-testid="logout-button"
          variant="outline"
          className="w-full rounded-full"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};