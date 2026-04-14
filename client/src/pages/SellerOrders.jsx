import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Eye,
  Download,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import api from '../utils/api';

const SellerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['seller-orders', user?.id, searchTerm, statusFilter, currentPage],
    enabled: !!user?.id,
    queryFn: () => api.getSellerOrders({ 
      search: searchTerm,
      status: statusFilter,
      page: currentPage,
      limit: 10
    }),
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => api.updateOrderStatus(orderId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['seller-orders', user?.id]);
      queryClient.invalidateQueries(['seller-stats', user?.id]);
      queryClient.invalidateQueries(['retailer-orders']);
      queryClient.invalidateQueries(['admin-stats']);
      
      // Show detailed success message
      let message = `Order status updated to ${data.newStatus}!`;
      
      if (data.newStatus === 'shipped') {
        message += `\n✅ Invoice ${data.invoiceGenerated ? 'generated successfully' : 'generation failed'}`;
        message += `\n📱 SMS ${data.smsAttempted ? 'sent to customer' : 'not sent (no phone number)'}`;
      } else if (data.newStatus === 'out_for_delivery') {
        message += `\n📱 SMS ${data.smsAttempted ? 'sent to customer' : 'not sent (no phone number)'}`;
      } else if (data.newStatus === 'delivered') {
        message += `\n📱 SMS ${data.smsAttempted ? 'sent to customer' : 'not sent (no phone number)'}`;
        message += `\n🎉 Order completed successfully!`;
      }
      
      alert(message);
    },
    onError: (error) => {
      console.error('Order update error:', error);
      alert(`Failed to update order: ${error.message}`);
    }
  });

  const handleStatusUpdate = (orderId, newStatus, orderDetails) => {
    const confirmMessages = {
      'shipped': `Mark order #${orderId.slice(-8)} as SHIPPED?\n\nThis will:\n• Generate PDF invoice\n• Send SMS to ${orderDetails.retailer?.businessName}\n• Make invoice available for download`,
      'out_for_delivery': `Mark order #${orderId.slice(-8)} as OUT FOR DELIVERY?\n\nThis will:\n• Update order status\n• Send SMS notification to customer`,
      'delivered': `Mark order #${orderId.slice(-8)} as DELIVERED?\n\nThis will:\n• Complete the order\n• Send final SMS notification\n• Move order to completed section`
    };

    if (confirm(confirmMessages[newStatus])) {
      updateOrderStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  const handleInvoiceDownload = async (orderId) => {
    try {
      const response = await api.downloadInvoice(orderId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download invoice');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-Order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Invoice download error:', error);
      alert(`Failed to download invoice: ${error.message}`);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      'ordered': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ordered': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-text-primary">Manage Orders</h1>
          <p className="text-text-secondary">Track and update your order status</p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by order ID, product, or retailer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Filter by Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Orders</option>
                  <option value="ordered">Ordered</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card p-6">
          {!ordersData?.orders?.length ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No orders found</h3>
              <p className="text-text-secondary">
                {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Orders will appear here once customers place them'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Order Details</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Retailer</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-text-primary">#{(order.id).toString().slice(-8)}</p>
                          <p className="text-sm text-text-secondary">{order.Product?.name}</p>
                          <p className="text-xs text-text-secondary">{order.quantity} {order.Product?.unit}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-text-primary">{order.retailer?.businessName}</p>
                          <p className="text-sm text-text-secondary">{order.retailer?.email}</p>
                          <p className="text-xs text-text-secondary">{order.retailer?.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-text-primary">₹{order.totalAmount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={getStatusClass(order.status)}>
                            {order.status.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-text-secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-2">
                          {/* Debug: Show current status */}
                          <div className="text-xs text-gray-500 mb-1">Status: "{order.status}"</div>
                          
                          {/* Status Update Buttons */}
                          {(order.status.toLowerCase() === 'ordered') && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'shipped', order)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              {updateOrderStatusMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Updating...
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Package className="w-4 h-4 mr-2" />
                                  Mark as Shipped
                                </div>
                              )}
                            </button>
                          )}
                          
                          {(order.status.toLowerCase() === 'shipped') && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'out_for_delivery', order)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              {updateOrderStatusMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Updating...
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Mark as Out for Delivery
                                </div>
                              )}
                            </button>
                          )}
                          
                          {(order.status.toLowerCase() === 'out_for_delivery') && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'delivered', order)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              {updateOrderStatusMutation.isPending ? (
                                <div className="flex items-center">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Updating...
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Delivered
                                </div>
                              )}
                            </button>
                          )}
                          
                          {(order.status.toLowerCase() === 'delivered') && (
                            <div className="flex items-center text-green-600 text-sm font-medium">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              ✓ Completed
                            </div>
                          )}
                          
                          {/* Fallback button for any unmatched status */}
                          {!['delivered', 'cancelled'].includes(order.status.toLowerCase()) && 
                           !['ordered', 'shipped', 'out_for_delivery'].includes(order.status.toLowerCase()) && (
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'shipped', order)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                              Mark as Shipped
                            </button>
                          )}
                          
                          {/* Download Invoice Button */}
                          {order.invoicePath && (
                            <button 
                              onClick={() => handleInvoiceDownload(order.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium text-center transition-colors flex items-center justify-center"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Invoice
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

          {/* Pagination */}
          {ordersData?.pagination?.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {ordersData.pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, ordersData.pagination.totalPages))}
                disabled={currentPage === ordersData.pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
