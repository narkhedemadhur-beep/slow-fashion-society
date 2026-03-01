import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/cart`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      setCart(response.data);

      // Fetch product details
      const productIds = response.data.items?.map(item => item.product_id) || [];
      const productDetails = {};
      await Promise.all(
        productIds.map(async (id) => {
          try {
            const res = await axios.get(`${API}/products/${id}`);
            productDetails[id] = res.data;
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
          }
        })
      );
      setProducts(productDetails);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/cart/remove`,
        { product_id: productId },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return (cart.items || []).reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-12" data-testid="cart-title">
          Shopping Cart
        </h1>

        {cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;

                return (
                  <div
                    key={item.product_id}
                    className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-border/50"
                    data-testid={`cart-item-${item.product_id}`}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.category} • {product.condition}
                      </p>
                      <p className="text-primary font-semibold">₹{product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      data-testid={`remove-item-${item.product_id}`}
                      className="self-start text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 sticky top-24">
                <h2 className="font-heading text-2xl font-medium mb-6" data-testid="order-summary-title">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="cart-total">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/checkout')}
                  data-testid="checkout-button"
                  className="w-full rounded-full"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <p className="text-xl text-muted-foreground mb-6" data-testid="empty-cart-message">
              Your cart is empty
            </p>
            <Button onClick={() => navigate('/shop')} data-testid="continue-shopping-button" className="rounded-full">
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};