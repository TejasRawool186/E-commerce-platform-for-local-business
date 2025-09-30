const { sequelize, Order, Product, User, OrderTimeline } = require('../sequelize');
const { Op } = require('sequelize');
const twilio = require('twilio');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function sendSMS(to, body) {
  if (!twilioClient || !to) return;
  try {
    await twilioClient.messages.create({ from: process.env.TWILIO_FROM, to, body });
  } catch (e) {
    console.error('SMS error:', e.message);
  }
}

function generateInvoice(order) {
  const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
  const invoicePath = path.join(invoicesDir, `${order.id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(invoicePath));
  doc.fontSize(18).text('Invoice', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${order.id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();
  doc.text(`Retailer: ${order.retailer?.businessName || order.retailer?.firstName || ''}`);
  doc.text(`Seller: ${order.seller?.businessName || order.seller?.firstName || ''}`);
  doc.moveDown();
  doc.text(`Product: ${order.Product?.name}`);
  doc.text(`Quantity: ${order.quantity} ${order.Product?.unit}`);
  doc.text(`Unit Price: ₹${order.unitPrice}`);
  doc.text(`Total: ₹${order.totalAmount}`);
  doc.end();
  return `/uploads/invoices/${order.id}.pdf`;
}

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;
    
    // Validation
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    const product = await Product.findByPk(productId, { include: [{ model: User, as: 'seller' }] });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive) {
      return res.status(400).json({ message: 'Product is not available' });
    }
    
    if (quantity < product.moq) {
      return res.status(400).json({ 
        message: `Quantity must be at least ${product.moq} ${product.unit}` 
      });
    }
    
    // Check if retailer is trying to order their own product
    if (req.user.id === product.sellerId) {
      return res.status(400).json({ message: 'Cannot order your own product' });
    }
    
    const totalAmount = product.price * quantity;
    const order = await Order.create({
      retailerId: req.user.id,
      sellerId: product.sellerId,
      productId,
      quantity: parseInt(quantity),
      unitPrice: product.price,
      totalAmount,
      status: 'pending',
      notes: notes ? notes.trim() : ''
    });
    await OrderTimeline.create({ orderId: order.id, status: 'pending', message: 'Order placed by retailer' });
    const populatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: Product },
        { model: User, as: 'seller', attributes: ['businessName','phone','whatsapp','email'] },
        { model: User, as: 'retailer', attributes: ['businessName','phone'] },
        { model: OrderTimeline, order: [['occurredAt','ASC']] }
      ]
    });
    await sendSMS(populatedOrder.retailer?.phone, `Order placed: ${populatedOrder.Product?.name} x ${populatedOrder.quantity}. Total ₹${populatedOrder.totalAmount}`);
    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// Get orders for retailer
exports.getRetailerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const where = { retailerId: req.user.id };
    const totalOrders = await Order.count({ where });
    const orders = await Order.findAll({
      where,
      include: [
        { model: Product },
        { model: User, as: 'seller', attributes: ['businessName','phone','whatsapp','email','pincode'] },
        { model: OrderTimeline }
      ],
      order: [['createdAt','DESC']],
      offset: skip,
      limit
    });
    
    res.json({ 
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for seller
exports.getSellerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const where = { sellerId: req.user.id };
    const totalOrders = await Order.count({ where });
    const orders = await Order.findAll({
      where,
      include: [
        { model: Product },
        { model: User, as: 'retailer', attributes: ['businessName','phone','whatsapp','email','pincode'] },
        { model: OrderTimeline }
      ],
      order: [['createdAt','DESC']],
      offset: skip,
      limit
    });
    
    res.json({ 
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order statistics for retailer
exports.getRetailerStats = async (req, res) => {
  try {
    const whereRetailer = { retailerId: req.user.id };
    const totalOrders = await Order.count({ where: whereRetailer });
    const pendingOrders = await Order.count({ where: { ...whereRetailer, status: 'pending' } });
    const orderedOrders = await Order.count({ where: { ...whereRetailer, status: 'ordered' } });
    const shippedOrders = await Order.count({ where: { ...whereRetailer, status: 'shipped' } });
    const ofdOrders = await Order.count({ where: { ...whereRetailer, status: 'out_for_delivery' } });
    const deliveredOrders = await Order.count({ where: { ...whereRetailer, status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { ...whereRetailer, status: 'cancelled' } });
    const totalSpentRow = await Order.findAll({
      where: { retailerId: req.user.id, status: { [Op.ne]: 'cancelled' } },
      attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']]
    });
    const totalSpent = parseFloat(totalSpentRow[0]?.get('total') || 0);
    
    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        orderedOrders,
        shippedOrders,
        ofdOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order statistics for seller
exports.getSellerStats = async (req, res) => {
  try {
    const whereSeller = { sellerId: req.user.id };
    const totalOrders = await Order.count({ where: whereSeller });
    const pendingOrders = await Order.count({ where: { ...whereSeller, status: 'pending' } });
    const orderedOrders = await Order.count({ where: { ...whereSeller, status: 'ordered' } });
    const shippedOrders = await Order.count({ where: { ...whereSeller, status: 'shipped' } });
    const ofdOrders = await Order.count({ where: { ...whereSeller, status: 'out_for_delivery' } });
    const deliveredOrders = await Order.count({ where: { ...whereSeller, status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { ...whereSeller, status: 'cancelled' } });
    const totalSalesRow = await Order.findAll({
      where: { sellerId: req.user.id, status: { [Op.ne]: 'cancelled' } },
      attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']]
    });
    const totalSales = parseFloat(totalSalesRow[0]?.get('total') || 0);
    
    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        orderedOrders,
        shippedOrders,
        ofdOrders,
        deliveredOrders,
        cancelledOrders,
        totalSales
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (seller only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ordered', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    const order = await Order.findOne({ where: { id: req.params.id, sellerId: req.user.id }, include: [
      { model: User, as: 'retailer', attributes: ['phone','businessName'] },
      { model: Product }
    ] });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }
    
    // Prevent status changes for cancelled or delivered orders
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({ message: `Cannot change status of ${order.status} order` });
    }
    
    order.status = status;
    await order.save();
    await OrderTimeline.create({ orderId: order.id, status, message: `Order ${status.replace(/_/g,' ')}` });

    // Invoice generation on 'ordered'
    if (status === 'ordered') {
      const invoiceUrl = generateInvoice(order);
      order.invoiceUrl = invoiceUrl; // not persisted unless column added; return in payload
    }

    // Notify retailer via SMS on important stages
    if (['ordered','shipped','out_for_delivery','delivered'].includes(status)) {
      await sendSMS(order.retailer?.phone, `Your order ${order.id} is now ${status.replace(/_/g,' ')}`);
    }

    const populatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: Product },
        { model: User, as: 'retailer', attributes: ['businessName','phone','whatsapp','email','pincode'] },
        { model: OrderTimeline }
      ]
    });

    res.json({ success: true, message: `Order status updated to ${status}`, order: populatedOrder });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};