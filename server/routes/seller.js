const express = require('express');
const router = express.Router();
const { getSellerProducts, updateProduct, deleteProduct, toggleProductStatus } = require('../controllers/productController');
const { getSellerOrders, getSellerStats, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Seller only middleware
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') return next();
  return res.status(403).json({ message: 'Seller access only' });
};

// Product management
router.get('/products', protect, sellerOnly, getSellerProducts);
router.put('/products/:id', protect, sellerOnly, updateProduct);
router.delete('/products/:id', protect, sellerOnly, deleteProduct);
router.patch('/products/:id/toggle', protect, sellerOnly, toggleProductStatus);

// Order management
router.get('/orders', protect, sellerOnly, getSellerOrders);
router.put('/orders/:id/status', protect, sellerOnly, updateOrderStatus);

// Analytics
router.get('/stats', protect, sellerOnly, getSellerStats);

module.exports = router;
