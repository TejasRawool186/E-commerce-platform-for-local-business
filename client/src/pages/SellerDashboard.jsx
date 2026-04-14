import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api, { getImageUrl } from '../utils/api';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const SellerDashboard = () => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-stats', user?.id],
    queryFn: () => api.getSellerStats(),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: () => api.getSellerOrders({ limit: 5 }),
    enabled: !!user?.id,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: () => api.getSellerProducts({ limit: 5 }),
    enabled: !!user?.id
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => api.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-orders', user?.id]);
      queryClient.invalidateQueries(['seller-stats', user?.id]);
      queryClient.invalidateQueries(['retailer-orders']);
      alert('Order status updated successfully!');
    },
    onError: (error) => {
      alert(`Failed to update order: ${error.message}`);
    }
  });

  const handleStatusUpdate = (orderId, newStatus) => {
    if (confirm(`Are you sure you want to update this order to ${newStatus}?`)) {
      updateOrderStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'ordered': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };


  const ordersChartData = {
    labels: ['Pending',  'Delivered'],
    datasets: [
      {
        data: [
          stats?.stats?.pendingOrders || 0,
          stats?.stats?.orderedOrders || 0,
          stats?.stats?.shippedOrders || 0,
          stats?.stats?.ofdOrders || 0,
          stats?.stats?.deliveredOrders || 0,
          stats?.stats?.cancelledOrders || 0,
        ],
        backgroundColor: [
          '#F59E0B',
          '#10B981',
          '#EF4444',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
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
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-secondary">Manage your products and orders</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/seller/analytics" className="btn-secondary flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Sales Analytics
            </Link>
            <Link href="/seller/products/new" className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              List New Product
            </Link>
          </div>
        </div>

        {/* Quick Access Card */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">Sales Analytics Dashboard</h3>
                <p className="text-blue-700 text-sm">
                  View detailed sales reports, interactive charts, and generate PDF reports
                </p>
              </div>
            </div>
            <Link href="/seller/analytics" className="btn-primary flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Open Analytics
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
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
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Completed Orders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.stats?.deliveredOrders || 0}
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
                <p className="text-sm font-medium text-text-secondary">Active Products</p>
                <p className="text-2xl font-bold text-text-primary">
                  {products?.pagination?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="card p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Orders by Status</h3>
            <Doughnut data={ordersChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>


        {/* Recent Orders */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
            <Link href="/seller/orders" className="btn-primary text-sm px-4 py-2">
              Manage All Orders
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : !recentOrders?.orders?.length ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-secondary">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Product</th>
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
                          <p className="text-sm text-text-secondary">{order.retailer?.businessName || order.retailerId?.businessName}</p>
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
                        <div className="flex flex-col space-y-1">
                          {(order.status === 'ordered' || order.status === 'Ordered') && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id || order._id, 'shipped')}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              {updateOrderStatusMutation.isPending ? 'Updating...' : 'Mark as Shipped'}
                            </button>
                          )}
                          {(order.status === 'shipped' || order.status === 'Shipped') && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id || order._id, 'out_for_delivery')}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              {updateOrderStatusMutation.isPending ? 'Updating...' : 'Mark as Out for Delivery'}
                            </button>
                          )}
                          {(order.status === 'out_for_delivery' || order.status === 'Out for Delivery') && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id || order._id, 'delivered')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              {updateOrderStatusMutation.isPending ? 'Updating...' : 'Mark as Delivered'}
                            </button>
                          )}
                          {(order.status === 'delivered' || order.status === 'Delivered') && (
                            <span className="text-green-600 text-xs font-medium">✓ Completed</span>
                          )}
                          {order.invoicePath && (
                            <a 
                              href={`/api/orders/${order.id}/invoice`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium text-center"
                            >
                              Download Invoice
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Recent Products</h3>
          <Link href="/seller/products" className="text-primary-500 hover:text-primary-700 text-sm font-medium">
            Manage Products
          </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : !products?.products?.length ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No products listed yet</p>
              <Link href="/seller/products/new" className="btn-primary">
                List Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.products.map((product) => (
                <div key={product.id || product._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <h4 className="font-medium text-text-primary mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <p className="text-2xl font-bold text-primary-500 mb-2">
                    ₹{product.price}
                  </p>
                  
                  <p className="text-sm text-text-secondary mb-4">
                    MOQ: {product.moq} {product.unit}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 btn-secondary text-center text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    <Link
                      href={`/seller/products/edit/${product._id}`}
                      className="btn-primary text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
