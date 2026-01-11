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
  }
}, { timestamps: true });

// We essentially only need one document for the site config.
// We can enforce this in the controller.

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
