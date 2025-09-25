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
    const populatedProduct = await Product.findById(product._id).populate('sellerId', 'businessName address pincode');
    res.status(201).json({ success: true, product: populatedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products (with optional filters)
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const query = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.category) query.category = req.query.category;
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    const totalProducts = await Product.countDocuments(query);
    let products = await Product.find(query)
      .populate('sellerId', 'businessName address pincode phone whatsapp email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Filter by pincode if provided (after population)
    if (req.query.pincode) {
      products = products.filter(product => 
        product.sellerId && product.sellerId.pincode === req.query.pincode
      );
    }
    
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    res.json({ 
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext,
        hasPrev,
        limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'businessName address pincode phone whatsapp email businessType');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get products for a seller
exports.getSellerProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalProducts = await Product.countDocuments({ sellerId: req.user.id });
    const products = await Product.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.json({ 
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};