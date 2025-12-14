const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productname: String,
    price: Number,
    ImageURL: String,
    quantity: { type: Number, default: 1 },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product' // Adjust if your model name is different
    }
  }],
  total: {
    type: Number,
    required: true
  },
  shippingInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
