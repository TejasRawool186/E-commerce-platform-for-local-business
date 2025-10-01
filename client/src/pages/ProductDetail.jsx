import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Package, MapPin, Phone, Mail, ShoppingCart, Loader as Loader2, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => api.getProduct(id)
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData) => api.placeOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries(['retailer-orders']);
      alert('Order placed successfully!');
      setLocation('/retailer/orders');
    },
    onError: (error) => {
      alert(`Failed to place order: ${error.message}`);
    }
  });

  const product = data?.product;
  const seller = product?.seller;

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (user.role !== 'retailer') {
      alert('Only retailers can place orders');
      return;
    }

    if (user.id === seller?.id) {
      alert('Cannot order your own product');
      return;
    }

    if (quantity > product.stock_quantity) {
      alert('Insufficient stock available');
      return;
    }

    placeOrderMutation.mutate({
      productId: product.id,
      quantity: parseInt(quantity)
    });
  };

  const totalAmount = product ? product.price * quantity : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => setLocation('/products')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setLocation('/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-white rounded-lg shadow-md flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="w-32 h-32 text-gray-400" />
              )}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold text-blue-600">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                <span>Stock: {product.stock_quantity} units</span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            </div>

            {isAuthenticated && user.role === 'retailer' && user.id !== seller?.id && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Place Order</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      max={product.stock_quantity}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available stock: {product.stock_quantity} units
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {quantity} units × ${parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placeOrderMutation.isPending || quantity < 1 || quantity > product.stock_quantity}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {placeOrderMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="w-5 h-5 mr-2" />
                    )}
                    Place Order
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {seller?.business_name || seller?.username}
                  </h4>
                </div>

                {seller?.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{seller.address}</span>
                  </div>
                )}

                <div className="flex space-x-4">
                  {seller?.phone_number && (
                    <a
                      href={`tel:${seller.phone_number}`}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                  )}

                  {seller?.email && (
                    <a
                      href={`mailto:${seller.email}`}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
