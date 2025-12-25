const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['General', 'Order Issue', 'Product Defect', 'Refund Request', 'Other'],
    default: 'Order Issue'
  },
  message: {
    type: String,
    required: true
  },
  adminResponse: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
