import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRelatedProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}/related`);
      setRelatedProducts(response.data);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (quantity > product.stock) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/cart/add`,
        { product_id: product.product_id, quantity, size: selectedSize },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/wishlist/add/${product.product_id}`,
        {},
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/reviews`,
        { product_id: product.product_id, rating: parseInt(rating), comment },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return null;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Image */}
          <div className="aspect-[3/4] relative overflow-hidden rounded-2xl">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-2">
                {product.category}
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-light tracking-tight mb-4" data-testid="product-name">
                {product.name}
              </h1>
              <p className="text-3xl font-semibold text-primary" data-testid="product-price">
                ₹{product.price.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(avgRating) ? 'fill-primary text-primary' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>

            <p className="text-lg leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            <div className="space-y-4">
              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Size</label>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        data-testid={`size-${size}`}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedSize === size
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="decrease-quantity"
                    className="w-10 h-10 rounded-full border border-gray-300 hover:border-primary flex items-center justify-center text-xl font-medium"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="text-xl font-medium w-12 text-center" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    data-testid="increase-quantity"
                    className="w-10 h-10 rounded-full border border-gray-300 hover:border-primary flex items-center justify-center text-xl font-medium"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({product.stock} available)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                data-testid="add-to-cart-button"
                className="flex-1 rounded-full"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={handleAddToWishlist}
                data-testid="add-to-wishlist-button"
                variant="outline"
                className="rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border pt-12">
          <h2 className="font-heading text-3xl font-medium tracking-tight mb-8" data-testid="reviews-title">
            Reviews ({reviews.length})
          </h2>

          {/* Submit Review Form */}
          {user && (
            <form onSubmit={handleSubmitReview} className="mb-12 bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="font-body text-lg font-medium mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        data-testid={`star-${star}`}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoverRating || rating)
                              ? 'fill-primary text-primary'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    data-testid="review-comment-input"
                    rows={4}
                    placeholder="Share your thoughts about this product..."
                  />
                </div>
                <Button type="submit" data-testid="submit-review-button" className="rounded-full">
                  Submit Review
                </Button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.review_id} className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">{review.user_name}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground" data-testid="no-reviews-message">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-12 mt-12">
            <h2 className="font-heading text-3xl font-medium tracking-tight mb-8" data-testid="related-products-title">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.product_id}
                  className="group cursor-pointer"
                  onClick={() => {
                    navigate(`/product/${relProduct.product_id}`);
                    window.scrollTo(0, 0);
                  }}
                  data-testid={`related-product-${relProduct.product_id}`}
                >
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={relProduct.images[0]}
                        alt={relProduct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-body text-sm font-medium">{relProduct.name}</h3>
                      <p className="text-primary font-semibold">₹{relProduct.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};