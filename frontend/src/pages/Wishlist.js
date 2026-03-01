import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ product_ids: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/wishlist`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      setWishlist(response.data);

      // Fetch product details
      const productIds = response.data.product_ids || [];
      const productPromises = productIds.map(id => axios.get(`${API}/products/${id}`));
      const productResponses = await Promise.all(productPromises);
      setProducts(productResponses.map(res => res.data));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/wishlist/remove/${productId}`,
        {},
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      toast.success('Item removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-12" data-testid="wishlist-title">
          My Wishlist
        </h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.product_id} className="group" data-testid={`wishlist-item-${product.product_id}`}>
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                  <button
                    onClick={() => handleRemove(product.product_id)}
                    data-testid={`remove-wishlist-${product.product_id}`}
                    className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-sm hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div
                    onClick={() => navigate(`/product/${product.product_id}`)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden rounded-lg mb-6">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-body text-base font-medium">{product.name}</h3>
                      <p className="text-primary font-semibold">₹{product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <p className="text-xl text-muted-foreground mb-6" data-testid="empty-wishlist-message">
              Your wishlist is empty
            </p>
            <Button onClick={() => navigate('/shop')} data-testid="browse-products-button" className="rounded-full">
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};