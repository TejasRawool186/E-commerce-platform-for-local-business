const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendSMS } = require('../utils/sms');
const { Op } = require('sequelize');
const { Order, Product, User } = require('../sequelize');
const path = require('path');
const fs = require('fs');

const ensureInvoicesDir = () => {
  const invoicesDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  return invoicesDir;
};

exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Please provide valid product ID and quantity.' });
    }

    const product = await Product.findByPk(productId, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'businessName', 'address', 'phone', 'email'] }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available.' });
    }

    const orderNumber = `ORD-${Date.now()}`;

    const totalAmount = parseFloat(product.price) * parseInt(quantity);
    const order = await Order.create({
      orderNumber,
      retailerId: req.user.id,
      sellerId: product.sellerId || product.seller?.id,
      productId: productId,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(product.price),
      totalAmount,
      status: 'Ordered'
    });

    product.stockQuantity = product.stockQuantity - quantity;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRetailerOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { retailerId: req.user.id },
      include: [
        { model: Product, attributes: ['id', 'name', 'imageUrl'] },
        { model: User, as: 'seller', attributes: ['firstName', 'businessName', 'phone'] }
      ],
      order: [['orderDate', 'DESC']]
    });
    res.json({ orders });
  } catch (err) {
    console.error('Get retailer orders error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const status = req.query.status;

    const where = { sellerId: req.user.id };
    if (status === 'pending') {
      where.status = { [Op.in]: ['Ordered', 'Shipped', 'Out for Delivery'] };
    } else if (status === 'completed') {
      where.status = 'Delivered';
    }
    const orders = await Order.findAll({
      where,
      include: [
        { model: Product, attributes: ['id', 'name', 'imageUrl'] },
        { model: User, as: 'retailer', attributes: ['firstName', 'businessName', 'phone', 'address'] }
      ],
      order: [['orderDate', 'DESC']]
    });
    res.json({ orders });
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Product, attributes: ['id', 'name', 'description', 'imageUrl', 'price'] },
        { model: User, as: 'seller', attributes: ['id', 'firstName', 'businessName', 'address', 'phone', 'email'] },
        { model: User, as: 'retailer', attributes: ['id', 'firstName', 'businessName', 'address', 'phone', 'email'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.retailerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findOne({
      where: { id: orderId, sellerId: req.user.id },
      include: [
        { model: Product, attributes: ['id', 'name', 'description', 'imageUrl', 'price'] },
        { model: User, as: 'seller', attributes: ['id', 'firstName', 'businessName', 'address', 'phone', 'email'] },
        { model: User, as: 'retailer', attributes: ['id', 'firstName', 'businessName', 'address', 'phone', 'email'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized.' });
    }

    const updateData = { status };

    if (status === 'Shipped' && !order.invoiceNumber) {
      const invoiceNumber = `INV-${Date.now()}`;
      updateData.invoiceNumber = invoiceNumber;
      updateData.shippedDate = new Date();

      const invoicesDir = ensureInvoicesDir();
      const invoicePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

      const invoiceData = {
        invoice_number: invoiceNumber,
        order_number: order.orderNumber,
        order_date: order.orderDate,
        quantity: order.quantity,
        unit_price: order.unitPrice,
        total_amount: order.totalAmount,
        product: order.Product,
        seller: order.seller,
        retailer: order.retailer
      };

      await generateInvoice(invoiceData, invoicePath);
      updateData.invoicePath = `/invoices/${invoiceNumber}.pdf`;

      if (order.retailer.phone) {
        await sendSMS(
          order.retailer.phone,
          `Your order ${order.orderNumber} for ${order.Product.name} has been shipped! Your invoice is now available for download. Thank you for your purchase.`
        );
      }
    } else if (status === 'Out for Delivery') {
      if (order.retailer.phone) {
        await sendSMS(
          order.retailer.phone,
          `Great news! Your order ${order.orderNumber} is out for delivery and will arrive soon.`
        );
      }
    } else if (status === 'Delivered') {
      updateData.deliveredDate = new Date();
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.retailerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!order.invoicePath) {
      return res.status(404).json({ message: 'Invoice not yet generated.' });
    }

    const invoicePath = path.join(__dirname, '..', order.invoicePath);

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ message: 'Invoice file not found.' });
    }

    res.download(invoicePath, `${order.invoiceNumber}.pdf`);
  } catch (err) {
    console.error('Download invoice error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await Order.findAll({ where: { sellerId } });
    const totalSales = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const stats = {
      totalSales,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['Ordered', 'Shipped', 'Out for Delivery'].includes(o.status)).length,
      orderedOrders: orders.filter(o => o.status === 'Ordered').length,
      shippedOrders: orders.filter(o => o.status === 'Shipped').length,
      ofdOrders: orders.filter(o => o.status === 'Out for Delivery').length,
      deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'Cancelled').length
    };
    res.json({ stats });
  } catch (err) {
    console.error('Get seller stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRetailerStats = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const orders = await Order.findAll({ where: { retailerId } });
    const totalSpent = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const stats = {
      totalSpent,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['Ordered', 'Shipped', 'Out for Delivery'].includes(o.status)).length,
      orderedOrders: orders.filter(o => o.status === 'Ordered').length,
      shippedOrders: orders.filter(o => o.status === 'Shipped').length,
      ofdOrders: orders.filter(o => o.status === 'Out for Delivery').length,
      deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
      processingOrders: orders.filter(o => ['Ordered', 'Shipped', 'Out for Delivery'].includes(o.status)).length
    };
    res.json({ stats });
  } catch (err) {
    console.error('Get retailer stats error:', err);
    res.status(500).json({ message: err.message });
  }
};
