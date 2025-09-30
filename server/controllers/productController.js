const { Product, User } = require('../sequelize');
const { Op } = require('sequelize');

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, moq, unit, brand, leadTime, images } = req.body;
    
    // Validation
    if (!name || !description || !category || !price || !moq || !unit) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    if (price < 0) {
      return res.status(400).json({ message: 'Price must be positive' });
    }
    
    if (moq < 1) {
      return res.status(400).json({ message: 'MOQ must be at least 1' });
    }
    
    if (leadTime && leadTime < 0) {
      return res.status(400).json({ message: 'Lead time cannot be negative' });
    }
    
    const product = await Product.create({
      sellerId: req.user.id,
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      moq: parseInt(moq),
      unit,
      brand: brand ? brand.trim() : undefined,
      leadTime: leadTime ? parseInt(leadTime) : undefined,
      images: images || []
    });
    const populatedProduct = await Product.findByPk(product.id, { include: [{ model: User, as: 'seller', attributes: ['businessName','address','pincode'] }] });
    res.status(201).json({ success: true, product: populatedProduct });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
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
    
    // Transform filters for Sequelize
    const where = { isActive: true };
    if (req.query.category) where.category = req.query.category;
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }
    const totalProducts = await Product.count({ where });
    let products = await Product.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['businessName','address','pincode','phone','whatsapp','email'] }],
      order: [['createdAt','DESC']],
      offset: skip,
      limit
    });

    // Text search filter after fetch (fallback without FULLTEXT index)
    if (req.query.search) {
      const term = String(req.query.search).toLowerCase();
      products = products.filter(p => (
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
      ));
    }
    
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
    const product = await Product.findByPk(req.params.id, { include: [{ model: User, as: 'seller', attributes: ['businessName','address','pincode','phone','whatsapp','email','businessType'] }] });
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
    
    const where = { sellerId: req.user.id };
    const totalProducts = await Product.count({ where });
    const products = await Product.findAll({ where, order: [['createdAt','DESC']], offset: skip, limit });
    
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

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, moq, unit, brand, leadTime, images } = req.body;
    
    // Validation
    if (!name || !description || !category || !price || !moq || !unit) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    if (price < 0) {
      return res.status(400).json({ message: 'Price must be positive' });
    }
    
    if (moq < 1) {
      return res.status(400).json({ message: 'MOQ must be at least 1' });
    }
    
    if (leadTime && leadTime < 0) {
      return res.status(400).json({ message: 'Lead time cannot be negative' });
    }
    
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    
    await Product.update({
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      moq: parseInt(moq),
      unit,
      brand: brand ? brand.trim() : undefined,
      leadTime: leadTime ? parseInt(leadTime) : undefined,
      images: images || []
    }, { where: { id: req.params.id } });
    const updatedProduct = await Product.findByPk(req.params.id, { include: [{ model: User, as: 'seller', attributes: ['businessName','address','pincode'] }] });
    
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle product status (active/inactive)
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    
    product.isActive = !product.isActive;
    await product.save();
    
    res.json({ 
      success: true, 
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      product 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};