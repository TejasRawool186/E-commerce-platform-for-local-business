import React from 'react';
import { Route, Router } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerOrders from './pages/RetailerOrders';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ListProduct from './pages/ListProduct';
import SellerProducts from './pages/SellerProducts';
import EditProduct from './pages/EditProduct';
import ProtectedRoute from './components/ProtectedRoute';


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
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        
         
        
        <ProtectedRoute path="/seller" component={SellerDashboard} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/products" component={SellerProducts} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/products/new" component={ListProduct} allowedRoles={['seller']} />
        <ProtectedRoute path="/seller/products/edit/:id" component={EditProduct} allowedRoles={['seller']} />
        <ProtectedRoute path="/retailer" component={RetailerDashboard} allowedRoles={['retailer']} />
        <ProtectedRoute path="/retailer/orders" component={RetailerOrders} allowedRoles={['retailer']} />
        <ProtectedRoute path="/admin" component={AdminDashboard} allowedRoles={['admin']} />
        
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        
        <AppRoutes />
      </AuthProvider>
    </QueryProvider>

    
  );
}

export default App;
