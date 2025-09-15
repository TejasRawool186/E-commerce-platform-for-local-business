import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Star
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    }
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['retailer-orders']);
      alert('Order placed successfully!');
      setLocation('/retailer');
    },
    onError: (error) => {
      alert(`Failed to place order: ${error.message}`);
    }
  });

  const product = data?.product;
  const seller = product?.sellerId;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= product.moq) {
      setQuantity(value);
    }
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (user.role !== 'retailer') {
      alert('Only retailers can place orders');
      return;
    }

    if (user._id === seller._id) {
      alert('Cannot order your own product');
      return;
    }

    placeOrderMutation.mutate({
      productId: product._id,
      quantity: quantity,
      notes: orderNotes
    });
  };

  const totalAmount = product ? product.price * quantity : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Product not found
          </h3>
          <p className="text-text-secondary mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => setLocation('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/products')}
          className="flex items-center text-text-secondary hover:text-text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="w-32 h-32 text-gray-400" />
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text-primary mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold text-primary-500">
                  ₹{product.price}
                </span>
                <span className="text-text-secondary">
                  per {product.unit}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-text-secondary mb-6">
                <span>MOQ: {product.moq} {product.unit}</span>
                {product.brand && <span>Brand: {product.brand}</span>}
                {product.leadTime && <span>Lead Time: {product.leadTime} days</span>}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-text-secondary leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-2">Category</h3>
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Order Section (for retailers) */}
            {isAuthenticated && user.role === 'retailer' && user._id !== seller._id && (
              <div className="card p-6 mb-6">
                <h3 className="font-semibold text-text-primary mb-4">Place Order</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min={product.moq}
                      className="input-field"
                    />
                    <p className="text-sm text-text-secondary mt-1">
                      Minimum order quantity: {product.moq} {product.unit}
                    </p>
                  </div>

                  <div>
                    <label className="form-label">Order Notes (Optional)</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      className="input-field"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-secondary">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary-500">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {quantity} {product.unit} × ₹{product.price}
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placeOrderMutation.isPending || quantity < product.moq}
                    className="btn-primary w-full flex items-center justify-center"
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

            {/* Seller Information */}
            <div className="card p-6">
              <h3 className="font-semibold text-text-primary mb-4">Seller Information</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-text-primary">{seller.businessName}</h4>
                  {seller.businessType && (
                    <p className="text-sm text-text-secondary">{seller.businessType}</p>
                  )}
                </div>

                <div className="flex items-center text-text-secondary">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{seller.address}, {seller.pincode}</span>
                </div>

                <div className="flex space-x-4">
                  {seller.phone && (
                    <a
                      href={`tel:${seller.phone}`}
                      className="flex items-center text-primary-500 hover:text-primary-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                  )}
                  
                  {seller.whatsapp && (
                    <a
                      href={`https://wa.me/${seller.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-500 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  )}
                  
                  <a
                    href={`mailto:${seller.email}`}
                    className="flex items-center text-primary-500 hover:text-primary-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
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
