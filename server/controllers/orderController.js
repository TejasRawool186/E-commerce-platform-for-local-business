const { User, Product, Order, OrderTimeline, sequelize } = require('../sequelize');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendSMS } = require('../utils/sms');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

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
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'email']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (quantity < product.moq) {
      return res.status(400).json({ message: `Minimum order quantity is ${product.moq}.` });
    }

    const orderNumber = `ORD-${Date.now()}`;
    const totalAmount = parseFloat(product.price) * parseInt(quantity);

    const order = await Order.create({
      retailerId: req.user.id,
      sellerId: product.sellerId,
      productId: productId,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(product.price),
      totalAmount: totalAmount,
      status: 'ordered'
    });

    // Create order timeline entry
    try {
      await OrderTimeline.create({
        orderId: order.id,
        status: 'ordered',
        message: 'Order placed successfully',
        occurredAt: new Date()
      });
    } catch (timelineError) {
      console.log('Timeline creation failed, but order was placed:', timelineError.message);
      // Don't fail the order if timeline creation fails
    }

        // Send SMS notification to retailer
    try {
      const retailer = await User.findByPk(req.user.id, { attributes: ['phone'] });
      if (retailer && retailer.phone) {
        let phoneNumber = retailer.phone.toString().trim();
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+91' + phoneNumber.replace(/^0+/, ''); // Assuming Indian numbers
        }
        const message = `Thank you for your order! Your LocalB2B order #${order.id.substring(0, 8)} for ${product.name} has been placed successfully.`;
        await sendSMS(phoneNumber, message);
        console.log(`✅ SMS sent to retailer ${retailer.id} for new order ${order.id}`);
      } else {
        console.log(`⚠️ No phone number for retailer ${req.user.id} to send new order SMS.`);
      }
    } catch (smsError) {
      console.log('❌ New order SMS notification failed:', smsError.message);
    }

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
        {
          model: Product,
          attributes: ['id', 'name', 'images']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['firstName', 'lastName', 'businessName', 'phone']
        }
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
      where.status = { [Op.in]: ['ordered', 'shipped', 'out_for_delivery'] };
    } else if (status === 'completed') {
      where.status = 'delivered';
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'images']
        },
        {
          model: User,
          as: 'retailer',
          attributes: ['firstName', 'lastName', 'businessName', 'phone', 'address']
        }
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
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'images']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'email']
        },
        {
          model: User,
          as: 'retailer',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'email']
        }
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

    if (!['shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

        const order = await Order.findOne({
      where: {
        id: orderId,
        sellerId: req.user.id
      },
      include: [
        { model: Product },
        { model: User, as: 'seller' },
        { model: User, as: 'retailer', attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'email'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized.' });
    }

    // Update order status
    await order.update({ status });

    // Create timeline entry
    await OrderTimeline.create({
      orderId: order.id,
      status,
      message: `Order status updated to ${status}`
    });

    // Generate invoice and send SMS when shipped
    if (status === 'shipped') {
      try {
        // Generate invoice
        const invoicesDir = ensureInvoicesDir();
        const invoiceFileName = `INV-${order.id}-${Date.now()}.pdf`;
        const invoicePath = path.join(invoicesDir, invoiceFileName);

        await generateInvoice(order, invoicePath);
        
        // Update order with invoice path
        await order.update({ 
          invoicePath: `/invoices/${invoiceFileName}`,
          shippedDate: new Date()
        });

        console.log(`Invoice generated: ${invoicePath}`);
      } catch (invoiceError) {
        console.error('Invoice generation failed:', invoiceError.message);
        // Don't fail the order update if invoice generation fails
      }
    }

    // Send SMS notification if retailer has phone number
    let smsAttempted = false;
    try {
      if (order.retailer?.phone) {
        // Ensure phone number is in proper format
        let phoneNumber = order.retailer.phone.toString().trim();
        
        // Add country code if not present
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+91' + phoneNumber.replace(/^0+/, ''); // Assuming Indian numbers
        }

        const message = `LocalB2B Order Update: Your order #${order.id.substring(0, 8)} has been ${status}. ${
          status === 'shipped' ? 'Your order is on the way! Track your delivery.' :
          status === 'out_for_delivery' ? 'Your order is out for delivery and will arrive soon!' :
          status === 'delivered' ? 'Your order has been delivered successfully. Thank you for choosing LocalB2B!' :
          'Status updated successfully.'
        }`;
        
        await sendSMS(phoneNumber, message);
        smsAttempted = true;
        console.log(`✅ SMS sent to ${phoneNumber} for order ${orderId}`);
      } else {
        console.log(`⚠️ No phone number found for retailer ${order.retailerId}`);
      }
    } catch (smsError) {
      console.log('❌ SMS notification failed:', smsError.message);
      // Don't fail the order update if SMS fails
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      newStatus: status,
      order,
      invoiceGenerated: status === 'shipped' && order.invoicePath ? true : false,
      smsAttempted: order.retailer?.phone ? true : false
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'unit']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'email']
        },
        {
          model: User,
          as: 'retailer',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.retailerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Check if order is shipped (invoice should only be available for shipped orders)
    if (!['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(404).json({ message: 'Invoice not yet available. Invoice will be generated once the order is shipped.' });
    }

    try {
      // Always regenerate invoice with latest design
      const invoicesDir = ensureInvoicesDir();
      const invoiceFileName = `INV-${order.id.substring(0, 8)}-${Date.now()}.pdf`;
      const invoicePath = path.join(invoicesDir, invoiceFileName);

      await generateInvoice(order, invoicePath);
      
      console.log(`✅ Fresh invoice generated: ${invoicePath}`);

      const fileName = `Invoice-Order-${order.id.substring(0, 8)}.pdf`;
      res.download(invoicePath, fileName, (err) => {
        if (err) {
          console.error('Download error:', err);
        } else {
          // Clean up the temporary file after download
          setTimeout(() => {
            try {
              if (fs.existsSync(invoicePath)) {
                fs.unlinkSync(invoicePath);
                console.log(`🗑️ Cleaned up temporary invoice: ${invoicePath}`);
              }
            } catch (cleanupError) {
              console.log('Cleanup error (non-critical):', cleanupError.message);
            }
          }, 5000); // Delete after 5 seconds
        }
      });
    } catch (invoiceError) {
      console.error('Invoice generation failed:', invoiceError.message);
      return res.status(500).json({ message: 'Failed to generate invoice. Please try again.' });
    }
  } catch (err) {
    console.error('Download invoice error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get seller statistics
exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get order counts by status
    const totalOrders = await Order.count({ where: { sellerId } });
    const pendingOrders = await Order.count({ 
      where: { 
        sellerId, 
        status: { [Op.in]: ['ordered', 'shipped', 'out_for_delivery'] }
      } 
    });
    const deliveredOrders = await Order.count({ 
      where: { sellerId, status: 'delivered' } 
    });

    // Get total revenue with proper null handling
    let totalRevenue = 0;
    try {
      const revenueResult = await Order.findOne({
        where: { sellerId, status: 'delivered' },
        attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'totalRevenue']]
      });
      totalRevenue = parseFloat(revenueResult?.dataValues?.totalRevenue || 0);
    } catch (revenueError) {
      console.log('Revenue calculation error:', revenueError.message);
      totalRevenue = 0;
    }

    // Get monthly sales data for chart
    let monthlySales = [];
    try {
      const monthlyData = await Order.findAll({
        where: { 
          sellerId, 
          status: 'delivered',
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), 0, 1) // This year
          }
        },
        attributes: [
          [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
        order: [[sequelize.fn('MONTH', sequelize.col('created_at')), 'ASC']]
      });

      monthlySales = monthlyData.map(item => ({
        month: item.dataValues.month,
        revenue: parseFloat(item.dataValues.revenue || 0)
      }));
    } catch (monthlyError) {
      console.log('Monthly sales calculation error:', monthlyError.message);
      monthlySales = [];
    }

    // Get average order value
    const avgOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

    // Get product count
    const totalProducts = await Product.count({ where: { sellerId } });

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        totalProducts,
        monthlySales
      }
    });
  } catch (err) {
    console.error('Get seller stats error:', err);
    // Return default stats instead of 500 error
    res.json({
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        totalProducts: 0,
        monthlySales: []
      }
    });
  }
};

// Get retailer statistics
exports.getRetailerStats = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Get order counts by status
    const totalOrders = await Order.count({ where: { retailerId } });
    const pendingOrders = await Order.count({ 
      where: { 
        retailerId, 
        status: { [Op.in]: ['ordered', 'shipped', 'out_for_delivery'] }
      } 
    });
    const deliveredOrders = await Order.count({ 
      where: { retailerId, status: 'delivered' } 
    });

    // Get total spent
    const spentResult = await Order.findAll({
      where: { retailerId, status: 'delivered' },
      attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSpent']]
    });
    const totalSpent = spentResult[0]?.dataValues?.totalSpent || 0;

    // Get average order value
    const avgOrderValue = deliveredOrders > 0 ? totalSpent / deliveredOrders : 0;

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalSpent: parseFloat(totalSpent),
        avgOrderValue: parseFloat(avgOrderValue)
      }
    });
  } catch (err) {
    console.error('Get retailer stats error:', err);
    res.status(500).json({ message: err.message });
  }
};
