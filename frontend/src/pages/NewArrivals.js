import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const NewArrivals = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      // Get latest 12 products
      const sorted = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 12);
      setProducts(sorted);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
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
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4">Latest</p>
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4" data-testid="new-arrivals-title">
            New Arrivals
          </h1>
          <p className="text-lg text-muted-foreground">
            Fresh finds added to our collection
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${product.product_id}`)}
              data-testid={`product-${product.product_id}`}
            >
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square relative overflow-hidden rounded-lg mb-6">
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
          ))}
        </div>

        <div className="text-center mt-12">
          <Button onClick={() => navigate('/shop')} data-testid="view-all-button" variant="outline" className="rounded-full">
            View All Products
          </Button>
        </div>
      </div>
    </div>
  );
};