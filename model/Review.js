const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    userId: String,
    userName: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    approved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

const reviewModel = mongoose.model("reviews", reviewSchema);

module.exports = reviewModel;
