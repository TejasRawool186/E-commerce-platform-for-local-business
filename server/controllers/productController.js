const { Op } = require('sequelize');
const { Product, User } = require('../sequelize');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, stockQuantity } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, description, and price.' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price must be positive.' });
    }

    const product = await Product.create({
      sellerId: req.user.id,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      images: imageUrl ? [imageUrl] : [],
      moq: 1,
      unit: 'pieces',
      brand: null,
      leadTime: null,
      isActive: true
    });

    res.status(201).json({ success: true, product: product.get({ plain: true }) });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['firstName', 'businessName', 'address', 'phone', 'email'] }],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    const totalPages = Math.ceil(count / limit);
    res.json({
      products: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['firstName', 'businessName', 'address', 'phone', 'email'] }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      where: { sellerId: req.user.id },
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });
    const totalPages = Math.ceil(count / limit);
    res.json({
      products: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });
  } catch (err) {
    console.error('Get seller products error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, stockQuantity } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, description, and price.' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price must be positive.' });
    }

    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    product.name = name.trim();
    product.description = description.trim();
    product.price = parseFloat(price);
    if (imageUrl) product.images = [imageUrl];
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Product not found or not authorized' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, sellerId: req.user.id } });
    if (!product) return res.status(404).json({ message: 'Product not found or not authorized' });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error('Toggle product status error:', err);
    res.status(500).json({ message: err.message });
  }
};
