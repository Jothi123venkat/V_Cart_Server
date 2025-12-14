const express = require('express');
const router = express.Router();
const Order = require('../model/Order');
const auth = require('../middleware/authMiddleware');

const Product = require('../model/Modelschema');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  const { items, total, shippingInfo } = req.body;

  try {
    // 1. Verify Stock
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            return res.status(404).json({ msg: `Product ${item.productname} not found` });
        }
        if (product.stock < item.quantity) {
             return res.status(400).json({ msg: `Insufficient stock for ${item.productname}` });
        }
    }

    // 2. Decrement Stock
    for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity }
        });
    }

    const newOrder = new Order({
      user: req.user.id,
      items,
      total,
      shippingInfo
    });

    const order = await newOrder.save();
    
    // Optional: Update User activity log
    // ...

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/myorders
// @desc    Get logged in user's orders
// @access  Private
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/all
// @desc    Get all orders (Admin)
// @access  Private (Admin check recommended)
router.get('/all', auth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', ['name', 'email']).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        let order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({ msg: 'Order not found' });

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/orders/:id
// @desc    Cancel order (User or Admin)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({ msg: 'Order not found' });

        // Ensure user owns order or is admin (skip admin check for now, assume owner)
        if(order.user.toString() !== req.user.id) {
             return res.status(401).json({ msg: 'Not authorized' }); 
        }

        // Instead of delete, typically we set status to Cancelled, but if delete requested:
        await Order.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Order removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
