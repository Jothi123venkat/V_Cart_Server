const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    productname:String,
    price:Number,
    ImageURL:String
})

const cardmodel = mongoose.model("cart",userschema);

module.exports = cardmodel;
