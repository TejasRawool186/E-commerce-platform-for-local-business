import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SellerDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      const response = await fetch('/api/orders/stats/seller');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await fetch('/api/seller/orders?limit=5');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    }
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const response = await fetch('/api/seller/products?limit=5');
      if (!response.ok) throw new Error('Failed to fetch products');
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

  const salesChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales (₹)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const ordersChartData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          stats?.stats?.pendingOrders || 0,
          stats?.stats?.processingOrders || 0,
          stats?.stats?.shippedOrders || 0,
          stats?.stats?.deliveredOrders || 0,
          stats?.stats?.cancelledOrders || 0,
        ],
        backgroundColor: [
          '#F59E0B',
          '#3B82F6',
          '#8B5CF6',
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-secondary">Manage your products and orders</p>
          </div>
          <Link href="/seller/products/new" className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            List New Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Sales</p>
                <p className="text-2xl font-bold text-text-primary">
                  ₹{stats?.stats?.totalSales?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Sales</h3>
            <Line data={salesChartData} options={chartOptions} />
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Orders by Status</h3>
            <Doughnut data={ordersChartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
            <Link href="/seller/orders" className="text-primary-500 hover:text-primary-700 text-sm font-medium">
              View All
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
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-mono">#{order._id.slice(-8)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{order.productId?.name}</p>
                          <p className="text-sm text-text-secondary">{order.retailerId?.businessName}</p>
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
                          <button className="text-primary-500 hover:text-primary-700">
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === 'pending' && (
                            <button className="text-green-500 hover:text-green-700">
                              <Edit className="w-4 h-4" />
                            </button>
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
              View All
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
                <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
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
                    <button className="btn-primary text-sm">
                      <Edit className="w-4 h-4" />
                    </button>
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
