import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORY_INFO = {
  'gen-z': {
    title: 'Gen Z Collection',
    description: 'Bold, trendy pieces for the digital generation',
    tag: 'gen-z'
  },
  'vintage-vibes': {
    title: 'Vintage Vibes',
    description: 'Timeless Y2K and 90s pieces',
    tag: 'vintage'
  },
  'trending-now': {
    title: 'Trending Now',
    description: 'What\'s hot in sustainable fashion',
    tag: 'trending'
  },
  'community-first': {
    title: 'Community First',
    description: 'Favorites from our community',
    tag: 'community'
  },
  'fast-drops': {
    title: 'Fast Drops',
    description: 'Latest additions to our collection',
    tag: 'fast-drops'
  }
};

export const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryInfo = CATEGORY_INFO[slug] || CATEGORY_INFO['gen-z'];

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      // For now, filter by category. Later we'll add tags to backend
      let filtered = response.data;
      
      if (slug === 'fast-drops') {
        // Show newest products
        filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12);
      } else if (slug === 'trending-now') {
        // Show featured products
        filtered = filtered.filter(p => p.is_featured);
      }
      // For other categories, show all products for now
      // TODO: Add tags system to backend for proper filtering
      
      setProducts(filtered);
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
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4" data-testid="category-title">
            {categoryInfo.title}
          </h1>
          <p className="text-lg text-muted-foreground">{categoryInfo.description}</p>
        </div>

        {products.length > 0 ? (
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
        ) : (
          <div className="text-center py-24">
            <p className="text-lg text-muted-foreground mb-6">No products in this category yet.</p>
            <Button onClick={() => navigate('/shop')} className="rounded-full">
              Browse All Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
