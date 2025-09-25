const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { businessName: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.role) query.role = req.query.role;
    
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Platform stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalRetailers = await User.countDocuments({ role: 'retailer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    
    const totalSalesResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;
    
    res.json({ 
      stats: {
        totalUsers,
        totalSellers,
        totalRetailers,
        totalAdmins,
        totalProducts,
        activeProducts,
        totalOrders,
        totalSales
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Recent activity (last 10 orders)
exports.getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'name category')
      .populate('retailerId sellerId', 'businessName');
    res.json({ orders: recentOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
