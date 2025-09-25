const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seller', 'retailer', 'admin'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  businessName: { type: String },
  businessType: { type: String, enum: ['Manufacturing', 'Trading', 'Service Provider', 'Distributor'], required: function() { return this.role === 'seller'; } },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String },
  whatsapp: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
