const express = require("express");
const cartrouter = express.Router();
const Cart = require("../model/Cart");
const auth = require("../middleware/authMiddleware");

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
cartrouter.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
        // Return empty items if no cart exists yet
        return res.json([]); 
    }
    // Filter out null products (in case product was deleted)
    cart.items = cart.items.filter(item => item.product);
    res.json(cart.items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/cart/add
// @desc    Add item to cart
// @access  Private
cartrouter.post("/add", auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Cart exists, check if item exists
      const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

      if (itemIndex > -1) {
        // Product exists in cart, update quantity (or simply do nothing if we just want to ensure it's there? user request implies "individual buy", likely standard cart)
        // Let's assume adding again increments, or sets? Usually '+' button increments.
        // For simple "Add to Cart" button: usually sets to 1 or increments if exists.
        // Let's increment.
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Product does not exist, push new item
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
      
      // Return updated Cart Items with populated product
      cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      return res.json(cart.items);
    } else {
      // No cart for user, create new cart
      const newCart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }]
      });
      
      // Populate and return
      let populatedCart = await Cart.findById(newCart._id).populate('items.product');
      return res.json(populatedCart.items);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/cart/:productId
// @desc    Remove item from cart
// @access  Private
cartrouter.delete("/:productId", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    // Filter out the item
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    
    await cart.save();
    
    // Return updated list
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json(cart.items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/cart
// @desc    Clear entire cart
// @access  Private
cartrouter.delete("/", auth, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json([]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = cartrouter;
