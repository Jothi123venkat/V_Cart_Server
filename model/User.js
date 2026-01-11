const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  addresses: [{
    label: String, // e.g., "Home", "Work"
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'productlist' // Must match the model name in Modelschema.js
  }],
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  activityLog: [{
    action: String, // e.g., "login", "update_profile"
    date: { type: Date, default: Date.now },
    details: String
  }],
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
