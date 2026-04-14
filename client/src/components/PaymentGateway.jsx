import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Building, 
  X, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

const PaymentGateway = ({ 
  isOpen, 
  onClose, 
  totalAmount, 
  onPaymentSuccess,
  orderDetails 
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('full'); // 'full' or 'advance'
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  if (!isOpen) return null;

  const advanceAmount = totalAmount * 0.3;
  const codAmount = totalAmount - advanceAmount;
  const payableAmount = selectedPaymentType === 'full' ? totalAmount : advanceAmount;

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Maestro, RuPay',
      icon: CreditCard,
      color: 'blue'
    },
    {
      id: 'netbanking',
      name: 'Netbanking',
      description: 'Pay with Internet Banking Account',
      icon: Building,
      color: 'green'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      description: 'Pay using a Wallet',
      icon: Wallet,
      color: 'purple'
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using BHIM, Tez and other UPI apps',
      icon: Smartphone,
      color: 'orange'
    }
  ];

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentData = {
        paymentType: selectedPaymentType,
        paymentMethod: selectedMethod,
        totalAmount,
        paidAmount: payableAmount,
        codAmount: selectedPaymentType === 'advance' ? codAmount : 0,
        paymentStatus: 'completed',
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      
      onPaymentSuccess(paymentData);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    if (selectedMethod === 'card') {
      return cardDetails.number.replace(/\s/g, '').length >= 16 &&
             cardDetails.expiry.length === 5 &&
             cardDetails.cvv.length >= 3 &&
             cardDetails.name.trim().length > 0;
    }
    return true; // For other payment methods, assume they're valid
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <p className="text-gray-600 mt-1">Choose your payment method and complete the order</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentType === 'full'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentType('full')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Full Payment</h4>
                    {selectedPaymentType === 'full' && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Pay the complete amount now</p>
                  <p className="text-lg font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentType === 'advance'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentType('advance')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">30% Advance</h4>
                    {selectedPaymentType === 'advance' && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Pay 30% now, rest on delivery</p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-blue-600">₹{advanceAmount.toFixed(2)} now</p>
                    <p className="text-sm text-gray-500">₹{codAmount.toFixed(2)} COD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-${method.color}-100 mr-4`}>
                          <IconComponent className={`w-6 h-6 text-${method.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {selectedMethod === method.id && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Details Form */}
            {selectedMethod === 'card' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay with Credit/Debit Card</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => handleCardInputChange('number', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange('expiry', formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder's Name
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other Payment Methods Info */}
            {selectedMethod !== 'card' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-blue-800 text-sm">
                    You will be redirected to complete the payment using {paymentMethods.find(m => m.id === selectedMethod)?.name}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Total</span>
                  <span className="text-gray-900">₹{totalAmount.toFixed(2)}</span>
                </div>
                
                {selectedPaymentType === 'advance' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Advance Payment (30%)</span>
                      <span className="text-blue-600">₹{advanceAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cash on Delivery</span>
                      <span className="text-orange-600">₹{codAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Amount Payable</span>
                    <span className="text-green-600">₹{payableAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || (selectedMethod === 'card' && !isFormValid())}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `PAY ₹${payableAmount.toFixed(2)}`
                )}
              </button>

              {selectedPaymentType === 'advance' && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-xs">
                    <strong>Note:</strong> Remaining ₹{codAmount.toFixed(2)} will be collected on delivery.
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
