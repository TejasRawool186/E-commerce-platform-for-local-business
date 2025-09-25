const Product = require('../models/Product');

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, moq, unit, brand, leadTime, images } = req.body;
    const product = await Product.create({
      sellerId: req.user.id,
      name,
      description,
      category,
      price,
      moq,
      unit,
      brand,
      leadTime,
      images
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products (with optional filters)
exports.getProducts = async (req, res) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.pincode) query['seller.pincode'] = req.query.pincode;
    // Add more filters as needed
  const products = await Product.find(query).populate('sellerId', 'businessName address pincode');
  res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'businessName address pincode');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get products for a seller
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
