const Order = require('../models/Order');
const Product = require('../models/Product');

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;
    const product = await Product.findById(productId).populate('sellerId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (quantity < product.moq) return res.status(400).json({ message: `Quantity must be at least ${product.moq} ${product.unit}` });
    
    // Check if retailer is trying to order their own product
    if (req.user.id === product.sellerId._id.toString()) {
      return res.status(400).json({ message: 'Cannot order your own product' });
    }
    
    const totalAmount = product.price * quantity;
    const order = await Order.create({
      retailerId: req.user.id,
      sellerId: product.sellerId,
      productId,
      quantity,
      unitPrice: product.price,
      totalAmount,
      notes: notes || ''
    });
    
    const populatedOrder = await Order.findById(order._id)
      .populate('productId', 'name category unit')
      .populate('sellerId', 'businessName phone whatsapp email');
    
    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for retailer
exports.getRetailerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalOrders = await Order.countDocuments({ retailerId: req.user.id });
    const orders = await Order.find({ retailerId: req.user.id })
      .populate('productId', 'name category unit images')
      .populate('sellerId', 'businessName phone whatsapp email pincode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for seller
exports.getSellerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalOrders = await Order.countDocuments({ sellerId: req.user.id });
    const orders = await Order.find({ sellerId: req.user.id })
      .populate('productId', 'name category unit images')
      .populate('retailerId', 'businessName phone whatsapp email pincode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order statistics for retailer
exports.getRetailerStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ retailerId: req.user.id });
    const pendingOrders = await Order.countDocuments({ retailerId: req.user.id, status: 'pending' });
    const processingOrders = await Order.countDocuments({ retailerId: req.user.id, status: 'processing' });
    const shippedOrders = await Order.countDocuments({ retailerId: req.user.id, status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ retailerId: req.user.id, status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ retailerId: req.user.id, status: 'cancelled' });
    
    const totalSpentResult = await Order.aggregate([
      { $match: { retailerId: req.user.id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
    
    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order statistics for seller
exports.getSellerStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ sellerId: req.user.id });
    const pendingOrders = await Order.countDocuments({ sellerId: req.user.id, status: 'pending' });
    const processingOrders = await Order.countDocuments({ sellerId: req.user.id, status: 'processing' });
    const shippedOrders = await Order.countDocuments({ sellerId: req.user.id, status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ sellerId: req.user.id, status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ sellerId: req.user.id, status: 'cancelled' });
    
    const totalSalesResult = await Order.aggregate([
      { $match: { sellerId: req.user.id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;
    
    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalSales
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
