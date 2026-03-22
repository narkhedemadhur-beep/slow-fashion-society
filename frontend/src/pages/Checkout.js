import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    payment_method: 'stripe'
  });

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

  const calculateTotal = () => {
    return (cart.items || []).reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create order items
      const orderItems = cart.items.map(item => {
        const product = products[item.product_id];
        return {
          product_id: item.product_id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0]
        };
      });

      // Create order
      const orderResponse = await axios.post(
        `${API}/orders`,
        {
          items: orderItems,
          total: calculateTotal(),
          payment_method: formData.payment_method,
          shipping_address: {
            full_name: formData.full_name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            phone: formData.phone
          }
        },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );

      const orderId = orderResponse.data.order_id;

      if (formData.payment_method === 'stripe') {
        // Create Stripe checkout session
        const originUrl = window.location.origin;
        const checkoutResponse = await axios.post(
          `${API}/payment/checkout`,
          { order_id: orderId, origin_url: originUrl },
          { 
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true 
          }
        );

        // Redirect to Stripe
        window.location.href = checkoutResponse.data.url;
      } else {
        // Cash on delivery
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-12" data-testid="checkout-title">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h2 className="font-heading text-2xl font-medium mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    data-testid="full-name-input"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    data-testid="address-input"
                    required
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      data-testid="city-input"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      data-testid="state-input"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      data-testid="zip-code-input"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      data-testid="phone-input"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h2 className="font-heading text-2xl font-medium mb-6">Payment Method</h2>
              <RadioGroup value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="stripe" id="stripe" data-testid="payment-stripe" />
                  <Label htmlFor="stripe" className="cursor-pointer">Credit/Debit Card (Stripe)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="upi" id="upi" data-testid="payment-upi" />
                  <Label htmlFor="upi" className="cursor-pointer">UPI Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" data-testid="payment-cod" />
                  <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              data-testid="place-order-button"
              className="w-full rounded-full py-6 text-lg"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Place Order'}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 sticky top-24">
              <h2 className="font-heading text-2xl font-medium mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map(item => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  return (
                    <div key={item.product_id} className="flex gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm text-primary font-semibold">${(product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary" data-testid="checkout-total">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
