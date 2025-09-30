const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  getSellerProducts,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.get('/', getProducts);
router.get('/featured', getProducts);
router.get('/:id', getProductById);

// Seller protected
router.post('/', protect, createProduct);

// Seller routes
router.get('/seller/my', protect, getSellerProducts);
router.put('/seller/:id', protect, updateProduct);
router.delete('/seller/:id', protect, deleteProduct);
router.patch('/seller/:id/toggle', protect, toggleProductStatus);

// Retailer routes  
router.get('/retailer/orders', protect, require('../controllers/orderController').getRetailerOrders);

// Seller order routes
router.get('/seller/orders', protect, require('../controllers/orderController').getSellerOrders);

// Image upload endpoint (max 5 images)
router.post('/upload', protect, upload.array('images', 5), (req, res) => {
	const files = req.files.map(file => `/uploads/${file.filename}`);
	res.json({ urls: files });
});

module.exports = router;
