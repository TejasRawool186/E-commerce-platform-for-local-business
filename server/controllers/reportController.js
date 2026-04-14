const { Order, Product, User } = require('../sequelize');
const { Op } = require('sequelize');

// @desc    Get sales report for a specific month and year
// @route   GET /api/seller/sales-report
// @access  Private/Seller
const getSalesReport = async (req, res) => {
  const { month, year } = req.query;
  const sellerId = req.user.id;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required' });
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const orders = await Order.findAll({
      where: {
        sellerId: sellerId,
        orderDate: { [Op.between]: [startDate, endDate] },
      },
      attributes: ['id', 'quantity', 'totalAmount', 'orderDate'],
      include: [
        {
          model: User,
          as: 'retailer',
          attributes: ['businessName'],
        },
        {
          model: Product,
          attributes: ['name'],
        },
      ],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the selected period' });
    }

    const totalAmount = orders.reduce((acc, order) => acc + parseFloat(order.totalAmount || 0), 0);

    const productSales = orders.reduce((acc, order) => {
      const productName = order.Product.name;
      acc[productName] = (acc[productName] || 0) + order.quantity;
      return acc;
    }, {});

    const retailerOrders = orders.reduce((acc, order) => {
      const retailerName = order.retailer.businessName;
      acc[retailerName] = (acc[retailerName] || 0) + 1;
      return acc;
    }, {});

    const productDistribution = orders.reduce((acc, order) => {
      const productName = order.Product.name;
      acc[productName] = (acc[productName] || 0) + parseFloat(order.totalAmount || 0);
      return acc;
    }, {});

    res.json({
      orders: orders.map(o => ({
        OrderID: o.id.toString().slice(-8),
        RetailerName: o.retailer.businessName,
        ProductName: o.Product.name,
        Quantity: o.quantity,
        Amount: parseFloat(o.totalAmount || 0),
        DateofOrder: o.orderDate.toISOString().split('T')[0],
      })),
      totalAmount,
      productSales,
      retailerOrders,
      productDistribution,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSalesReport };
