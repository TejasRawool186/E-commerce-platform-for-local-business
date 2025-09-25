const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, getSellerProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Seller protected
router.post('/', protect, createProduct);
router.get('/seller/my', protect, getSellerProducts);

// Image upload endpoint (max 5 images)
router.post('/upload', protect, upload.array('images', 5), (req, res) => {
	const files = req.files.map(file => `/uploads/${file.filename}`);
	res.json({ urls: files });
});

module.exports = router;
