const { supabase } = require('../config/supabase');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendSMS } = require('../utils/sms');
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

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, seller:users!products_seller_id_fkey(id, username, business_name, address, phone_number, email)')
      .eq('id', productId)
      .maybeSingle();

    if (productError) throw productError;

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available.' });
    }

    const { data: orderNumberData } = await supabase.rpc('generate_order_number');
    const orderNumber = orderNumberData || `ORD-${Date.now()}`;

    const totalAmount = parseFloat(product.price) * parseInt(quantity);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        retailer_id: req.user.id,
        seller_id: product.seller_id,
        product_id: productId,
        quantity: parseInt(quantity),
        unit_price: parseFloat(product.price),
        total_amount: totalAmount,
        status: 'Ordered'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: product.stock_quantity - quantity })
      .eq('id', productId);

    if (updateError) throw updateError;

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
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(id, name, image_url),
        seller:users!orders_seller_id_fkey(username, business_name, phone_number)
      `)
      .eq('retailer_id', req.user.id)
      .order('order_date', { ascending: false });

    if (error) throw error;

    res.json({ orders });
  } catch (err) {
    console.error('Get retailer orders error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const status = req.query.status;

    let query = supabase
      .from('orders')
      .select(`
        *,
        product:products(id, name, image_url),
        retailer:users!orders_retailer_id_fkey(username, business_name, phone_number, address)
      `)
      .eq('seller_id', req.user.id);

    if (status === 'pending') {
      query = query.in('status', ['Ordered', 'Shipped', 'Out for Delivery']);
    } else if (status === 'completed') {
      query = query.eq('status', 'Delivered');
    }

    query = query.order('order_date', { ascending: false });

    const { data: orders, error } = await query;

    if (error) throw error;

    res.json({ orders });
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(id, name, description, image_url),
        seller:users!orders_seller_id_fkey(id, username, business_name, address, phone_number, email),
        retailer:users!orders_retailer_id_fkey(id, username, business_name, address, phone_number, email)
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.retailer_id !== req.user.id && order.seller_id !== req.user.id) {
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

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(id, name, description, image_url, price),
        seller:users!orders_seller_id_fkey(id, username, business_name, address, phone_number, email),
        retailer:users!orders_retailer_id_fkey(id, username, business_name, address, phone_number, email)
      `)
      .eq('id', orderId)
      .eq('seller_id', req.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized.' });
    }

    const updateData = { status };

    if (status === 'Shipped' && !order.invoice_number) {
      const { data: invoiceNumberData } = await supabase.rpc('generate_invoice_number');
      const invoiceNumber = invoiceNumberData || `INV-${Date.now()}`;
      updateData.invoice_number = invoiceNumber;
      updateData.shipped_date = new Date().toISOString();

      const invoicesDir = ensureInvoicesDir();
      const invoicePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

      const invoiceData = {
        invoice_number: invoiceNumber,
        order_number: order.order_number,
        order_date: order.order_date,
        quantity: order.quantity,
        unit_price: order.unit_price,
        total_amount: order.total_amount,
        product: order.product,
        seller: order.seller,
        retailer: order.retailer
      };

      await generateInvoice(invoiceData, invoicePath);
      updateData.invoice_path = `/invoices/${invoiceNumber}.pdf`;

      if (order.retailer.phone_number) {
        await sendSMS(
          order.retailer.phone_number,
          `Your order ${order.order_number} for ${order.product.name} has been shipped! Your invoice is now available for download. Thank you for your purchase.`
        );
      }
    } else if (status === 'Out for Delivery') {
      if (order.retailer.phone_number) {
        await sendSMS(
          order.retailer.phone_number,
          `Great news! Your order ${order.order_number} is out for delivery and will arrive soon.`
        );
      }
    } else if (status === 'Delivered') {
      updateData.delivered_date = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('invoice_path, invoice_number, retailer_id, seller_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.retailer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!order.invoice_path) {
      return res.status(404).json({ message: 'Invoice not yet generated.' });
    }

    const invoicePath = path.join(__dirname, '..', order.invoice_path);

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ message: 'Invoice file not found.' });
    }

    res.download(invoicePath, `${order.invoice_number}.pdf`);
  } catch (err) {
    console.error('Download invoice error:', err);
    res.status(500).json({ message: err.message });
  }
};
