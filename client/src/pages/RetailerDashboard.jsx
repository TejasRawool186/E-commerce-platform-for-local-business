import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  ShoppingCart, 
  Eye,
  Phone,
  MessageCircle,
  Mail,
  Loader2,
  MapPin,
  User as UserIcon,
  Edit
} from 'lucide-react';

const RetailerDashboard = () => {
  const { user } = useAuth();

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['retailer-orders', user?.id],
    enabled: !!user?.id,
    queryFn: () => api.getRetailerOrders({ limit: 10 }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['me', user?.id],
    enabled: !!user?.id,
    queryFn: () => api.getMe(),
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'ordered': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'out_for_delivery': return 'status-processing';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Retailer Dashboard</h1>
            <p className="text-text-secondary">Manage your orders and discover products</p>
          </div>

          {/* Profile Card */}
          <div className="card p-4 w-full md:w-auto">
            {userLoading ? (
              <div className="flex items-center space-x-3">
                <div className="skeleton w-12 h-12 rounded-full"></div>
                <div className="flex flex-col space-y-2">
                  <div className="skeleton h-4 w-32"></div>
                  <div className="skeleton h-3 w-40"></div>
                </div>
              </div>
            ) : user && (
              <div className="flex items-center space-x-4">
                <UserIcon className="w-10 h-10 text-primary-500" />
                <div>
                  <h3 className="font-semibold text-text-primary">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                  <p className="text-sm text-text-secondary font-medium">Phone: {user.phoneNumber || 'Not set'}</p>
                </div>
                <Link href="/profile/edit" className="ml-auto text-primary-500 hover:text-primary-700">
                  <Edit className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>


        {/* Quick Actions */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products" className="btn-primary text-center">
              Browse Products
            </Link>
            <Link href="/products" className="btn-secondary text-center">
              Search by Category
            </Link>
            <Link href="/products" className="btn-secondary text-center">
              Find Local Suppliers
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
            <Link href="/retailer/orders" className="text-primary-500 hover:text-primary-700 text-sm font-medium">
              View All Orders
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : !recentOrders?.orders?.length ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No orders yet</p>
              <Link href="/products" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Seller</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.orders.map((order) => (
                    <tr key={order.id || order._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-mono">#{(order.id || order._id).slice(-8)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{order.Product?.name || order.productId?.name}</p>
                          <p className="text-sm text-text-secondary">{order.Product?.category || order.productId?.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{order.seller?.businessName || order.sellerId?.businessName}</p>
                          <p className="text-sm text-text-secondary flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.seller?.pincode || order.sellerId?.pincode}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{order.quantity} {order.Product?.unit || order.productId?.unit}</td>
                      <td className="py-3 px-4 text-sm font-medium">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusClass(order.status)}>
                          {order.status.replaceAll('_',' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-primary-500 hover:text-primary-700" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`tel:${order.sellerId?.phone}`}
                            className="text-green-500 hover:text-green-700"
                            title="Call Seller"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`https://wa.me/${order.sellerId?.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-700"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${order.sellerId?.email}`}
                            className="text-blue-500 hover:text-blue-700"
                            title="Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default RetailerDashboard;
