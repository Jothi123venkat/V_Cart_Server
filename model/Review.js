const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'productlist'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean,
        default: true // Set to true by default for now to simplify flow
    }
}, {
    timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
