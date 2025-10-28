import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ProductCardSkeleton } from './components/LoadingSkeleton';
import EcommercePlatform from './components/EcommercePlatform';
import ProductsListPage from './components/ProductsListPage';
import ProductDetailPage from './components/ProductDetailPage';
import EnhancedCheckout from './components/EnhancedCheckout';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';
import CartSidebar from './components/CartSidebar';
import CustomerSupportChat from './components/CustomerSupportChat';
import ProductRecommendations from './components/ProductRecommendations';
import BlogPage from './components/BlogPage';
import BlogDetail from './components/BlogDetail';
import BlogManagement from './components/BlogManagement';
import ProtectedRoute from './components/ProtectedRoute';
import SEO from './components/SEO';
import AnalyticsTracker from './components/AnalyticsTracker';
import CustomerProfileDashboard from './components/CustomerProfileDashboard';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe('pk_test_51OnP8kDlRy5x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3x8Z3');

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsTracker />
        <SEO 
          title="TechMart Haiti - Ecommerce Platform"
          description="Shop the latest products in Haiti. Best deals on electronics, fashion, home goods, and more!"
          keywords="ecommerce, shopping, haiti, techmart, products, deals"
        />
        <Suspense fallback={<ProductCardSkeleton />}>
          <AuthProvider>
            <CurrencyProvider>
              <CartSidebar />
              <CustomerSupportChat />
              <Routes>
                <Route path="/" element={<EcommercePlatform />} />
              <Route path="/products" element={<ProductsListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/dashboard" element={<CustomerProfileDashboard />} />
              <Route path="/account" element={<CustomerProfileDashboard />} />
              <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route 
                  path="/admin/blog" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <BlogManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <Elements stripe={stripePromise}>
                      <EnhancedCheckout />
                    </Elements>
                  } 
                />
                <Route 
                  path="/vendor/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="vendor">
                      <VendorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/recommendations" element={<ProductRecommendations />} />
              </Routes>
            </CurrencyProvider>
          </AuthProvider>
        </Suspense>
      </BrowserRouter>
      </ErrorBoundary>
  );
}

export default App;

