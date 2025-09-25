const express = require('express');
const router = express.Router();
const { 
  placeOrder, 
  getRetailerOrders, 
  getSellerOrders,
  getRetailerStats,
  getSellerStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Retailer places order
router.post('/', protect, placeOrder);

// Retailer gets their orders
router.get('/retailer', protect, getRetailerOrders);

// Retailer stats
router.get('/stats/retailer', protect, getRetailerStats);

// Seller gets their orders
router.get('/seller', protect, getSellerOrders);

// Seller stats
router.get('/stats/seller', protect, getSellerStats);

module.exports = router;
