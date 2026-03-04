import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { Toaster } from './components/ui/sonner';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthCallback } from './pages/AuthCallback';
import { About } from './pages/About';
import { Support } from './pages/Support';
import { Socials } from './pages/Socials';
import { Feedback } from './pages/Feedback';
import { NewArrivals } from './pages/NewArrivals';
import { Admin } from './pages/Admin';
import { GenZ } from './pages/GenZ';
import { Terms } from './pages/Terms';
import { CategoryPage } from './pages/CategoryPage';

import '@/App.css';

function AppRouter() {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  const hideHeaderFooter = ['/login', '/signup', '/auth-callback'].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/socials" element={<Socials />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/gen-z" element={<GenZ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
      <MobileNav />
      <Toaster position="top-center" />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
