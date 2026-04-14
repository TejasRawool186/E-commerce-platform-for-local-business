const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getRetailerOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  downloadInvoice
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/retailer', protect, getRetailerOrders);
router.get('/seller', protect, getSellerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.get('/:id/invoice', protect, downloadInvoice);

module.exports = router;
