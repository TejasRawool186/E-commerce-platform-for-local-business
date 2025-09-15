import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Eye,
  Phone,
  MessageCircle,
  Mail,
  Loader2,
  MapPin
} from 'lucide-react';

const RetailerDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['retailer-stats'],
    queryFn: async () => {
      const response = await fetch('/api/orders/stats/retailer');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['retailer-orders'],
    queryFn: async () => {
      const response = await fetch('/api/retailer/orders?limit=10');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Retailer Dashboard</h1>
          <p className="text-text-secondary">Manage your orders and discover products</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Pending Orders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.pendingOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Spent</p>
                <p className="text-2xl font-bold text-text-primary">
                  ₹{stats?.stats?.totalSpent?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Delivered Orders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.deliveredOrders || 0}
                </p>
              </div>
            </div>
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
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-mono">#{order._id.slice(-8)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{order.productId?.name}</p>
                          <p className="text-sm text-text-secondary">{order.productId?.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{order.sellerId?.businessName}</p>
                          <p className="text-sm text-text-secondary flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.sellerId?.pincode}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{order.quantity} {order.productId?.unit}</td>
                      <td className="py-3 px-4 text-sm font-medium">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={getStatusClass(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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

        {/* Order Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {stats?.stats?.pendingOrders || 0}
            </div>
            <div className="text-sm text-text-secondary">Pending</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats?.stats?.processingOrders || 0}
            </div>
            <div className="text-sm text-text-secondary">Processing</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats?.stats?.shippedOrders || 0}
            </div>
            <div className="text-sm text-text-secondary">Shipped</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats?.stats?.deliveredOrders || 0}
            </div>
            <div className="text-sm text-text-secondary">Delivered</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {stats?.stats?.cancelledOrders || 0}
            </div>
            <div className="text-sm text-text-secondary">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
