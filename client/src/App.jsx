import React from 'react';
import { Route, Router } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryClient';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import SalesAnalyticsDashboard from './pages/SalesAnalyticsDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerOrders from './pages/RetailerOrders';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ListProduct from './pages/ListProduct';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import EditProduct from './pages/EditProduct';
import EditProfile from './pages/EditProfile';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';


const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
       
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        
         
        
        <ProtectedRoute path="/seller" component={SellerDashboard} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/dashboard" component={SellerDashboard} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/analytics" component={SalesAnalyticsDashboard} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/products" component={SellerProducts} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/orders" component={SellerOrders} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/products/new" component={ListProduct} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/products/edit/:id" component={EditProduct} allowedRoles={['seller']} />
        <ProtectedRoute path="/retailer" component={RetailerDashboard} allowedRoles={['retailer']} />
        <ProtectedRoute path="/retailer/orders" component={RetailerOrders} allowedRoles={['retailer']} />
        <ProtectedRoute path="/admin" component={AdminDashboard} allowedRoles={['admin']} />
        <ProtectedRoute path="/profile/edit" component={EditProfile} allowedRoles={['retailer', 'seller']} />
        
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster position="bottom-right" />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
