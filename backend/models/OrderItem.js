const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    specialInstructions: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderItem', orderItemSchema);
