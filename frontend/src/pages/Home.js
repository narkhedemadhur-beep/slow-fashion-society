import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products/featured`)
      ]);
      setCategories(categoriesRes.data.slice(0, 4));
      setFeaturedProducts(productsRes.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1624192647570-1131acc12ccf?crop=entropy&cs=srgb&fm=jpg&q=85)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight leading-tight text-white mb-6" data-testid="hero-title">
            Timeless Fashion,
            <br />
            <span className="font-accent italic">Sustainably Curated</span>
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Discover unique vintage pieces and thrifted treasures that tell a story.
          </p>
          <Button 
            onClick={() => navigate('/shop')} 
            data-testid="shop-now-button"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Shop by Category - Bento Grid */}
      <section className="py-24 md:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4">Explore</p>
            <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight" data-testid="categories-title">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
            {categories.map((category, idx) => (
              <div
                key={category.category_id}
                className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                  idx === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'
                }`}
                onClick={() => navigate(`/shop?category=${category.slug}`)}
                data-testid={`category-card-${category.slug}`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="font-heading text-3xl md:text-4xl font-medium text-white">
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4">Curated for You</p>
            <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight" data-testid="featured-title">
              Featured Pieces
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.product_id}
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${product.product_id}`)}
                data-testid={`product-card-${product.product_id}`}
              >
                {/* Polaroid-style card */}
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] relative overflow-hidden rounded-lg mb-6">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-body text-lg font-medium">{product.name}</h3>
                    <p className="text-primary font-semibold">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{product.condition} condition</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/shop')} 
              data-testid="view-all-button"
              className="rounded-full border border-primary text-primary hover:bg-primary/10 px-8 py-3 transition-all"
              variant="outline"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 md:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1769107805528-964f4de0e342?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Sustainable Fashion"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4">Our Mission</p>
              <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-6">
                Fashion That Cares
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                At Slow Fashion Society, we believe in the power of pre-loved fashion. Each piece in our collection is carefully selected, bringing you unique, high-quality items while reducing fashion waste.
              </p>
              <p className="text-lg leading-relaxed mb-8">
                Join us in making sustainable choices without compromising on style.
              </p>
              <Button 
                onClick={() => navigate('/about')} 
                data-testid="learn-more-button"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3"
              >
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};