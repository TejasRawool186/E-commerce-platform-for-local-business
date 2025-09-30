const express = require('express');
const router = express.Router();
const { getRetailerOrders, getRetailerStats } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Retailer only middleware
const retailerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'retailer') return next();
  return res.status(403).json({ message: 'Retailer access only' });
};

// Order management
router.get('/orders', protect, retailerOnly, getRetailerOrders);

// Analytics
router.get('/stats', protect, retailerOnly, getRetailerStats);

module.exports = router;


