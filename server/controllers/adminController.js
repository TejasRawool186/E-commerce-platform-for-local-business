const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Activate/Deactivate user
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Platform stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const sellers = await User.countDocuments({ role: 'seller' });
    const retailers = await User.countDocuments({ role: 'retailer' });
    const admins = await User.countDocuments({ role: 'admin' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    res.json({ totalUsers, sellers, retailers, admins, totalProducts, totalOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Recent activity (last 10 orders)
exports.getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('productId').populate('retailerId sellerId', 'businessName');
    res.json(recentOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
