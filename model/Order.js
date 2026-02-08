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
      ref: 'productlist'
    },
    isReviewed: {
      type: Boolean,
      default: false
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
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Return Rejected'],
    default: 'Processing'
  },
  returnReason: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
