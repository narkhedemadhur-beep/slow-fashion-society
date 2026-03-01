import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceSort, setPriceSort] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, search, priceSort]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (search) params.search = search;
      
      const response = await axios.get(`${API}/products`, { params });
      let sorted = response.data;
      
      if (priceSort === 'low') {
        sorted = sorted.sort((a, b) => a.price - b.price);
      } else if (priceSort === 'high') {
        sorted = sorted.sort((a, b) => b.price - a.price);
      }
      
      setProducts(sorted);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4" data-testid="shop-title">
            Shop
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover our curated collection of sustainable fashion
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="search-input"
              className="pl-10 rounded-lg"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="category-select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.category_id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priceSort} onValueChange={setPriceSort}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="price-sort-select">
              <SelectValue placeholder="Sort by Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Price: Low to High</SelectItem>
              <SelectItem value="high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8" data-testid="products-grid">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${product.product_id}`)}
                data-testid={`product-${product.product_id}`}
              >
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
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
                    <p className="text-xs text-muted-foreground">{product.condition}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-lg text-muted-foreground" data-testid="no-products-message">
              No products found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};