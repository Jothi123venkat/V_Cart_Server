const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    type: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    active: { type: Boolean, default: true },
    expiryDate: Date,
    minPurchase: { type: Number, default: 0 },
    usageLimit: Number,
    usedCount: { type: Number, default: 0 }
});

const couponModel = mongoose.model("coupons", couponSchema);

module.exports = couponModel;
