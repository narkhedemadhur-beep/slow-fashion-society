import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && user) {
      checkPaymentStatus(sessionId);
    } else {
      setChecking(false);
    }
  }, [searchParams, user]);

  const checkPaymentStatus = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/payment/status/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      setPaymentStatus(response.data);
      
      // Poll for payment completion
      if (response.data.payment_status !== 'paid') {
        setTimeout(() => checkPaymentStatus(sessionId), 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="text-center max-w-md">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" data-testid="success-icon" />
        <h1 className="font-heading text-4xl font-light tracking-tight mb-4" data-testid="success-title">
          Order Confirmed!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been successfully placed and will be processed soon.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/orders')} data-testid="view-orders-button" className="rounded-full">
            View Orders
          </Button>
          <Button onClick={() => navigate('/shop')} data-testid="continue-shopping-button" variant="outline" className="rounded-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};