const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied', 'cleaning', 'unavailable'],
      default: 'available',
    },
    currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
    qrCode: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
