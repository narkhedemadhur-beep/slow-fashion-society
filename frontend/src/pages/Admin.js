import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Tops',
    price: '',
    images: '',
    sizes: '',
    stock: '1',
    condition: 'Good',
    is_featured: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const config = { headers, withCredentials: true };

      const [productsRes, ordersRes, feedbackRes] = await Promise.all([
        axios.get(`${API}/products`, config),
        axios.get(`${API}/orders/all`, config),
        axios.get(`${API}/feedback`, config)
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setFeedback(feedbackRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      images: productForm.images.split(',').map(s => s.trim()),
      sizes: productForm.sizes.split(',').map(s => s.trim()),
      stock: parseInt(productForm.stock)
    };

    try {
      const token = localStorage.getItem('token');
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.product_id}`, data, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true
        });
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/products`, data, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true
        });
        toast.success('Product added!');
      }
      
      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        category: 'Tops',
        price: '',
        images: '',
        sizes: '',
        stock: '1',
        condition: 'Good',
        is_featured: false
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      images: product.images.join(', '),
      sizes: product.sizes.join(', '),
      stock: product.stock.toString(),
      condition: product.condition,
      is_featured: product.is_featured
    });
    setShowProductDialog(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/products/${productId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      toast.success('Product deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/orders/${orderId}/status?status=${newStatus}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true
        }
      );
      toast.success('Order status updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-12" data-testid="admin-title">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
            <TabsTrigger value="orders" data-testid="orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="feedback" data-testid="feedback-tab">Feedback</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-2xl font-medium">Products</h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="add-product-button" className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        data-testid="product-name-input"
                        required
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        data-testid="product-description-input"
                        required
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                        <SelectTrigger data-testid="product-category-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tops">Tops</SelectItem>
                          <SelectItem value="Dresses">Dresses</SelectItem>
                          <SelectItem value="Outerwear">Outerwear</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Bags">Bags</SelectItem>
                          <SelectItem value="Shoes">Shoes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        data-testid="product-price-input"
                        required
                      />
                    </div>
                    <div>
                      <Label>Images (comma-separated URLs)</Label>
                      <Input
                        value={productForm.images}
                        onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                        data-testid="product-images-input"
                        required
                      />
                    </div>
                    <div>
                      <Label>Sizes (comma-separated)</Label>
                      <Input
                        value={productForm.sizes}
                        onChange={(e) => setProductForm({...productForm, sizes: e.target.value})}
                        data-testid="product-sizes-input"
                        placeholder="S, M, L"
                      />
                    </div>
                    <div>
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        data-testid="product-stock-input"
                        required
                      />
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Select value={productForm.condition} onValueChange={(val) => setProductForm({...productForm, condition: val})}>
                        <SelectTrigger data-testid="product-condition-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={productForm.is_featured}
                        onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                        data-testid="product-featured-checkbox"
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>
                    <Button type="submit" data-testid="save-product-button" className="w-full rounded-full">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.product_id} className="bg-white rounded-xl p-4 shadow-sm border border-border/50">
                  <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-3" />
                  <h3 className="font-medium mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <p className="text-primary font-semibold mb-3">${product.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                      data-testid={`edit-product-${product.product_id}`}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.product_id)}
                      data-testid={`delete-product-${product.product_id}`}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="font-heading text-2xl font-medium">Orders</h2>
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-xl p-6 shadow-sm border border-border/50" data-testid={`order-${order.order_id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">Order ID: {order.order_id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total: ${order.total.toFixed(2)}</p>
                  </div>
                  <Select value={order.status} onValueChange={(val) => handleUpdateOrderStatus(order.order_id, val)}>
                    <SelectTrigger className="w-40" data-testid={`order-status-${order.order_id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Shipping Address:</p>
                  <p>{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                  <p>{order.shipping_address.phone}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <h2 className="font-heading text-2xl font-medium">Feedback</h2>
            {feedback.map((item) => (
              <div key={item.feedback_id} className="bg-white rounded-xl p-6 shadow-sm border border-border/50" data-testid={`feedback-${item.feedback_id}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">{item.user_email || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-muted-foreground">{item.message}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
