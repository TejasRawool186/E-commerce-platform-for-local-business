const express = require('express');
const router = express.Router();
const { placeOrder, getRetailerOrders, getSellerOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Retailer places order
router.post('/', protect, placeOrder);

// Retailer gets their orders
router.get('/retailer/my', protect, getRetailerOrders);

// Seller gets their orders
router.get('/seller/my', protect, getSellerOrders);

module.exports = router;
