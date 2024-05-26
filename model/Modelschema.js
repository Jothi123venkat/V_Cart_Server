const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
    productname:String,
    productdescription:String,
    price:Number,
    ImageURL:String,
})

const usermodel = mongoose.model("productlist",userschema);

module.exports = usermodel;
