const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['electronics', 'machinery', 'furniture', 'food', 'textiles', 'chemicals', 'other'], required: true },
  price: { type: Number, required: true },
  moq: { type: Number, required: true },
  unit: { type: String, default: 'pieces' },
  brand: { type: String },
  leadTime: { type: Number },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
