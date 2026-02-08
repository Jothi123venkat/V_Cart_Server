const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  customerDetails: {
    name: { type: String, required: true },
    address: String,
    gstin: String,
    mobile: String,
    email: String,
    state: String // For IGST vs CGST/SGST logic
  },
  items: [{
    productName: String,
    hsnCode: String,
    quantity: Number,
    rate: Number, // Unit Price (Taxable)
    discount: { type: Number, default: 0 },
    taxableValue: Number, // (Rate * Qty) - Discount
    cgst: { rate: Number, amount: Number },
    sgst: { rate: Number, amount: Number },
    igst: { rate: Number, amount: Number },
    total: Number // Taxable + Tax
  }],
  taxSummary: {
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 }
  },
  subTotal: { type: Number, required: true }, // Before Tax
  roundOff: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  paymentDetails: {
    mode: { 
        type: String, 
        enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Credit', 'Mixed'],
        default: 'Cash' 
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial'],
        default: 'Unpaid'
    },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    transactionId: String
  },
  
  notes: String,
  termsAndConditions: String,
  
  // Store info snapshot at time of invoice creation
  storeDetails: {
      name: String,
      address: String,
      gstin: String,
      email: String,
      phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
