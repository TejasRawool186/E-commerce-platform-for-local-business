const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// User model (UUID primary key to align with existing string ids)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('seller', 'retailer', 'admin'), allowNull: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  businessName: { type: DataTypes.STRING },
  businessType: { type: DataTypes.ENUM('Manufacturing', 'Trading', 'Service Provider', 'Distributor') },
  address: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  whatsapp: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Product model
const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { 
    type: DataTypes.ENUM('electronics', 'machinery', 'furniture', 'food', 'textiles', 'chemicals', 'other'), 
    allowNull: false 
  },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING },
  moq: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unit: { type: DataTypes.STRING, defaultValue: 'pieces' },
  brand: { type: DataTypes.STRING },
  leadTime: { type: DataTypes.INTEGER },
  images: { type: DataTypes.JSON, defaultValue: [] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Order model with statuses
const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderNumber: { type: DataTypes.STRING, unique: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { 
    type: DataTypes.ENUM('Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
    defaultValue: 'Ordered' 
  },
  orderDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT },
  invoiceNumber: { type: DataTypes.STRING },
  invoicePath: { type: DataTypes.STRING },
  shippedDate: { type: DataTypes.DATE },
  deliveredDate: { type: DataTypes.DATE }
});

// OrderTimeline model to track events
const OrderTimeline = sequelize.define('OrderTimeline', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { 
    type: DataTypes.ENUM('Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
    allowNull: false
  },
  message: { type: DataTypes.STRING },
  occurredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Associations
User.hasMany(Product, { foreignKey: { name: 'sellerId', allowNull: false } });
Product.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

User.hasMany(Order, { as: 'retailerOrders', foreignKey: { name: 'retailerId', allowNull: false } });
User.hasMany(Order, { as: 'sellerOrders', foreignKey: { name: 'sellerId', allowNull: false } });
Order.belongsTo(User, { as: 'retailer', foreignKey: 'retailerId' });
Order.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

Product.hasMany(Order, { foreignKey: { name: 'productId', allowNull: false } });
Order.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderTimeline, { foreignKey: { name: 'orderId', allowNull: false } });
OrderTimeline.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderTimeline
};

