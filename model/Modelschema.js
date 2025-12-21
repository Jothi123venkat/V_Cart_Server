const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    productname: String,
    productdescription: String,
    price: Number,
    ImageURL: String,
    category: { type: String, default: 'Uncategorized' },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    colors: [String],
    sizes: [String],
    material: String
})

const usermodel = mongoose.model("productlist", userschema);

module.exports = usermodel;
