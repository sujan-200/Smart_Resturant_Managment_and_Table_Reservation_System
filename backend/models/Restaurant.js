const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Cinder & Cedar' },
    tagline: { type: String, default: 'Modern dining with a warm local touch' },
    location: { type: String, default: 'Downtown Avenue, Kathmandu' },
    description: { type: String, default: 'A premium restaurant blending modern dining with traditional flavours.' },
    phone: { type: String, default: '+977-9800000000' },
    email: { type: String, default: 'hello@cinderandcedar.com' },
    rating: { type: Number, default: 4.8 },
    cuisine: { type: String, default: 'Contemporary Fusion' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
