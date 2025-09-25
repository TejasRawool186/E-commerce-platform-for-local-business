const Order = require('../models/Order');
const Product = require('../models/Product');

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (quantity < product.moq) return res.status(400).json({ message: 'Quantity less than MOQ' });
    const totalAmount = product.price * quantity;
    const order = await Order.create({
      retailerId: req.user.id,
      sellerId: product.sellerId,
      productId,
      quantity,
      unitPrice: product.price,
      totalAmount
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for retailer
exports.getRetailerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ retailerId: req.user.id }).populate('productId').populate('sellerId', 'businessName');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for seller
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id }).populate('productId').populate('retailerId', 'businessName');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
