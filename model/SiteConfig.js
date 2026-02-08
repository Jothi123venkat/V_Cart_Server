const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  brandName: {
    type: String,
    default: 'V-CART'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  heroTitle: {
    type: String,
    default: 'Elevate Your Style with V-Cart'
  },
  heroSubtitle: {
    type: String,
    default: 'Discover the latest trends in fashion and accessories.'
  },
  heroButtonText: {
    type: String,
    default: 'Shop Now'
  },
  heroImage: {
    type: String, // You might store a URL here
    default: '' 
  },
  // We can add more sections as needed, e.g., for Featured Collections titles, etc.
  footerText: {
    type: String,
    default: '© 2026 V-Cart. All rights reserved.'
  },
  contactEmail: {
      type: String,
      default: 'support@vcart.com'
  },
  contactPhone: {
      type: String,
      default: '+1 234 567 890'
  },
  
  // New Sections
  curatedCollections: {
      title: { type: String, default: 'The Collection' },
      subtitle: { type: String, default: 'CURATED SELECTION' },
      items: [{
          title: String,
          image: String, // URL
          link: String
      }]
  },
  
  flashSale: {
      title: { type: String, default: "Don't Miss Out!" },
      subtitle: { type: String, default: "Limited time offers - Grab them before they're gone!" },
      startTime: Date,
      endTime: Date,
      isActive: { type: Boolean, default: true }
  },
  
  invoiceSettings: {
      gstin: { type: String, default: '' },
      taxRate: { type: Number, default: 18 },
      termsAndConditions: { type: String, default: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the bill is not paid within the due date.\n3. Subject to local jurisdiction.' },
      startInvoiceNumber: { type: Number, default: 1 },
      prefix: { type: String, default: 'INV' }, // e.g., INV-2024-001
      address: { type: String, default: '' }, // Store address for the invoice
      storeName: { type: String, default: 'V-CART' },
      bankDetails: {
          bankName: { type: String, default: '' },
          accountNo: { type: String, default: '' },
          ifscCode: { type: String, default: '' },
          branch: { type: String, default: '' }
      },
      // Template Configuration
      headerTitle: { type: String, default: 'TAX INVOICE' },
      customFields: [{
          label: { type: String, required: true },
          value: { type: String, default: '' },
          type: { type: String, enum: ['text', 'number', 'date', 'boolean'], default: 'text' },
          section: { type: String, enum: ['header', 'footer', 'billDetails'], default: 'header' }
      }],
      tableColumns: [{
          key: String,
          label: String,
          active: Boolean
      }]
  }
}, { timestamps: true });

// We essentially only need one document for the site config.
// We can enforce this in the controller.

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
