import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../utils/api';
import PaymentGateway from '../components/PaymentGateway';
import { 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  CreditCard,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount 
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Redirect if not authenticated or not a retailer
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (user && user.role !== 'retailer') {
      toast.error('Only retailers can access the cart');
      setLocation('/');
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setIsProcessing(true);
    
    try {
      // Group items by seller for multiple orders
      const ordersBySeller = cart.items.reduce((acc, item) => {
        const sellerId = item.seller?.id || item.sellerId;
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {});

      // Create orders for each seller (same as before, no payment data sent to backend)
      const orderPromises = Object.entries(ordersBySeller).map(async ([sellerId, items]) => {
        for (const item of items) {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              productId: item.id,
              quantity: item.quantity
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to place order for ${item.name}`);
          }
        }
      });

      await Promise.all(orderPromises);
      
      clearCart();
      setShowPaymentGateway(false);
      
      // Show success message based on payment type
      if (paymentData.paymentType === 'advance') {
        toast.success(`Payment successful! ₹${paymentData.paidAmount.toFixed(2)} paid. Remaining ₹${paymentData.codAmount.toFixed(2)} will be collected on delivery.`);
      } else {
        toast.success(`Payment successful! ₹${paymentData.totalAmount.toFixed(2)} paid. All orders placed successfully!`);
      }
      
      setLocation('/retailer/orders');
      
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(`Failed to place orders: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || (user && user.role !== 'retailer')) {
    return null;
  }

  const cartTotal = getCartTotal();
  const itemsCount = getCartItemsCount();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">
                {itemsCount} {itemsCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          
          {cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear Cart
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Package className="w-5 h-5 mr-2" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={getImageUrl(item.images[0])}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`flex items-center justify-center w-full h-full ${item.images && item.images.length > 0 ? 'hidden' : ''}`}>
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link 
                              href={`/products/${item.id}`}
                              className="hover:text-blue-600"
                            >
                              {item.name}
                            </Link>
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>₹{parseFloat(item.price).toFixed(2)} per {item.unit}</span>
                            <span>MOQ: {item.moq} {item.unit}</span>
                            <span>{item.seller?.businessName || 'Unknown Seller'}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                            disabled={item.quantity <= item.moq}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 mb-2">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({itemsCount})</span>
                    <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.items.length === 0}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  <p className="mb-2">
                    <strong>Note:</strong> Orders will be placed separately for each seller.
                  </p>
                  <p>
                    You can track all your orders in the Orders section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Gateway Modal */}
        <PaymentGateway
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          totalAmount={cartTotal}
          onPaymentSuccess={handlePaymentSuccess}
          orderDetails={{
            items: cart.items,
            itemsCount,
            total: cartTotal
          }}
        />
      </div>
    </div>
  );
};

export default Cart;
