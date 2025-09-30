const { sequelize, User, Product, Order } = require('../sequelize');
const { Op } = require('sequelize');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { firstName: { [Op.like]: term } },
        { lastName: { [Op.like]: term } },
        { email: { [Op.like]: term } },
        { businessName: { [Op.like]: term } }
      ];
    }
    if (req.query.role) where.role = req.query.role;

    const totalUsers = await User.count({ where });
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt','DESC']],
      offset: skip,
      limit
    });
    
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
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByPk(req.params.id);
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
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalRetailers = await User.count({ where: { role: 'retailer' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });
    const totalOrders = await Order.count();

    const totalSalesRow = await Order.findAll({
      where: { status: { [Op.ne]: 'cancelled' } },
      attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']]
    });
    const totalSales = parseFloat(totalSalesRow[0]?.get('total') || 0);
    
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
    const recentOrders = await Order.findAll({
      order: [['createdAt','DESC']],
      limit: 10,
      include: [
        { model: Product, attributes: ['name','category'] },
        { model: User, as: 'retailer', attributes: ['businessName'] },
        { model: User, as: 'seller', attributes: ['businessName'] }
      ]
    });
    res.json({ orders: recentOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
