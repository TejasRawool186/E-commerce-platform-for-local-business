const { supabase } = require('../config/supabase');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, stockQuantity } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, description, and price.' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price must be positive.' });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        seller_id: req.user.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image_url: imageUrl || null,
        stock_quantity: stockQuantity || 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, product });
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

    let query = supabase
      .from('products')
      .select('*, seller:users!products_seller_id_fkey(username, business_name, address, phone_number, email)', { count: 'exact' })
      .gte('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.search) {
      query = query.ilike('name', `%${req.query.search}%`);
    }

    if (req.query.minPrice) {
      query = query.gte('price', parseFloat(req.query.minPrice));
    }

    if (req.query.maxPrice) {
      query = query.lte('price', parseFloat(req.query.maxPrice));
    }

    const { data: products, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    res.json({
      products,
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
    const { data: product, error } = await supabase
      .from('products')
      .select('*, seller:users!products_seller_id_fkey(username, business_name, address, phone_number, email)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

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

    const { data: products, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('seller_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    res.json({
      products,
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

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image_url: imageUrl || null,
        stock_quantity: stockQuantity !== undefined ? stockQuantity : 0
      })
      .eq('id', req.params.id)
      .eq('seller_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('seller_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: err.message });
  }
};
