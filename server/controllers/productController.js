const { User, Product } = require('../sequelize');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure public/uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to validate and process image URLs (supports both local and cloud URLs)
const processImageUrls = (images) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images
    .filter(img => img && typeof img === 'string')
    .map(img => {
      // If it's already a full URL (Cloudinary, etc.), keep it as is
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      // Handle local uploads (legacy support)
      else if (img.startsWith('/uploads/')) {
        return img;
      } else if (img.includes('uploads/')) {
        // Convert absolute path to relative web path
        const filename = path.basename(img);
        return `/uploads/${filename}`;
      } else {
        // Assume it's just a filename (legacy)
        return `/uploads/${img}`;
      }
    })
    .slice(0, 5); // Limit to 5 images maximum
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, moq, unit, brand, leadTime, images } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: 'Please provide name, description, price, and category.' 
      });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price must be positive.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Process and validate image URLs
    const processedImages = processImageUrls(images);

    const product = await Product.create({
      sellerId: req.user.id,
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      moq: parseInt(moq) || 1,
      unit: unit || 'pieces',
      brand: brand?.trim() || null,
      leadTime: parseInt(leadTime) || null,
      images: JSON.stringify(processedImages) // Ensure JSON string format
    });

    // Return product with parsed images for frontend
    const productResponse = {
      ...product.toJSON(),
      images: processedImages
    };

    console.log(`✅ Product created: ${name} with ${processedImages.length} images`);
    res.status(201).json({ success: true, product: productResponse });

  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, moq, unit, brand, leadTime, images } = req.body;
    const productId = req.params.id;

    const product = await Product.findOne({
      where: { id: productId, sellerId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }

    // Process and validate image URLs
    const processedImages = processImageUrls(images);

    await product.update({
      name: name?.trim() || product.name,
      description: description?.trim() || product.description,
      category: category || product.category,
      price: price ? parseFloat(price) : product.price,
      moq: moq ? parseInt(moq) : product.moq,
      unit: unit || product.unit,
      brand: brand?.trim() || product.brand,
      leadTime: leadTime ? parseInt(leadTime) : product.leadTime,
      images: JSON.stringify(processedImages)
    });

    // Return updated product with parsed images
    const updatedProduct = {
      ...product.toJSON(),
      images: processedImages
    };

    console.log(`✅ Product updated: ${product.name} with ${processedImages.length} images`);
    res.json({ success: true, product: updatedProduct });

  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = { isActive: true };

    // Search functionality
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Category filter
    if (req.query.category) {
      where.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) {
        where.price[Op.gte] = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        where.price[Op.lte] = parseFloat(req.query.maxPrice);
      }
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'pincode', 'phone']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Parse images for each product
    const productsWithParsedImages = products.map(product => {
      const productJson = product.toJSON();
      try {
        productJson.images = typeof productJson.images === 'string' 
          ? JSON.parse(productJson.images) 
          : productJson.images || [];
      } catch (e) {
        productJson.images = [];
      }
      return productJson;
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      products: productsWithParsedImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'pincode', 'phone', 'email']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Parse images for response
    const productResponse = product.toJSON();
    try {
      productResponse.images = typeof productResponse.images === 'string' 
        ? JSON.parse(productResponse.images) 
        : productResponse.images || [];
    } catch (e) {
      productResponse.images = [];
    }

    res.json({ product: productResponse });

  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = { sellerId: req.user.id };

    // Search functionality for seller's own products
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Category filter
    if (req.query.category) {
      where.category = req.query.category;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Parse images for each product
    const productsWithParsedImages = products.map(product => {
      const productJson = product.toJSON();
      try {
        productJson.images = typeof productJson.images === 'string' 
          ? JSON.parse(productJson.images) 
          : productJson.images || [];
      } catch (e) {
        productJson.images = [];
      }
      return productJson;
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      products: productsWithParsedImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (err) {
    console.error('Get seller products error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user.id;
  console.log(`[DELETE] Request for product ID: ${productId} from seller ID: ${sellerId}`);

  try {
    console.log('[DELETE] Searching for product in database...');
    const product = await Product.findOne({
      where: { id: productId, sellerId: sellerId }
    });

    if (!product) {
      console.log(`[DELETE] Product not found or user is not authorized. Responding with 404.`);
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }

    console.log(`[DELETE] Product found: ${product.name}. Proceeding with deletion.`);

    // Step 1: Delete associated images from the filesystem
    const images = JSON.parse(product.images || '[]');
    console.log(`[DELETE] Found ${images.length} images to delete.`);
    images.forEach(imagePath => {
      const filename = path.basename(imagePath);
      const filePath = path.join(__dirname, '../public/uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[DELETE] Successfully deleted image file: ${filename}`);
        } catch (err) {
          console.error(`[DELETE] Error deleting image file ${filename}:`, err);
        }
      }
    });

    // Step 2: Permanently delete the product from the database
    console.log('[DELETE] Destroying product record from database...');
    await product.destroy();
    console.log(`[DELETE] Successfully destroyed product record for: ${product.name}`);

    res.json({ success: true, message: 'Product deleted successfully.' });

  } catch (err) {
    console.error('[DELETE] An unexpected error occurred:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, sellerId: req.user.id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }

    await product.update({ isActive: !product.isActive });

    res.json({ 
      success: true, 
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully.`,
      isActive: product.isActive
    });

  } catch (err) {
    console.error('Toggle product status error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'pincode']
      }],
      limit: 6,
      order: [['createdAt', 'DESC']]
    });

    // Parse images for each product
    const productsWithParsedImages = products.map(product => {
      const productJson = product.toJSON();
      try {
        productJson.images = typeof productJson.images === 'string' 
          ? JSON.parse(productJson.images) 
          : productJson.images || [];
      } catch (e) {
        productJson.images = [];
      }
      return productJson;
    });

    res.json({ products: productsWithParsedImages });

  } catch (err) {
    console.error('Get featured products error:', err);
    res.status(500).json({ message: err.message });
  }
};
