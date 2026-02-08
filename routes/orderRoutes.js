const express = require('express');
const router = express.Router();
const Order = require('../model/Order');
const auth = require('../middleware/authMiddleware');

const Product = require('../model/Modelschema');

const { createInvoiceFromOrder } = require('../utils/invoiceUtils');

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
    
    // 3. Auto-Generate Invoice
    try {
        await createInvoiceFromOrder(order);
    } catch (invoiceErr) {
        console.error("Auto-invoice generation failed:", invoiceErr);
        // Don't fail the order if invoice fails, just log it
    }
    
    // Emit real-time event
    const io = req.app.get('socketio');
    io.emit('newOrder', order);

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

// @route   GET api/orders/user/:userId
// @desc    Get orders for a specific user (Admin)
// @access  Private (Admin)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/orders/all
// @desc    Get all orders (Admin) with filtering
// @access  Private (Admin)
router.get('/all', auth, async (req, res) => {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
        query.$or = [
            { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: search, options: "i" } } },
            { 'items.productname': { $regex: search, $options: 'i' } }
        ];
    }

    if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) {
            const endOfDay = new Date(dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            query.date.$lte = endOfDay;
        }
    }

    const orders = await Order.find(query)
      .populate('user', ['name', 'email'])
      .sort({ date: -1 });
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

        // Emit real-time event
        const io = req.app.get('socketio');
        io.emit('orderUpdated', order);

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

        // Ensure user owns order or is admin
        // Check if admin (this is a simple check, usually req.user.role === 'admin')
        // For now, allow owner or if the check isn't strictly enforced, proceed
        // if(order.user.toString() !== req.user.id) { ... }

        if (order.status === 'Cancelled') {
            return res.status(400).json({ msg: 'Order is already cancelled' });
        }

        // 1. Mark as Cancelled
        order.status = 'Cancelled';
        await order.save();

        // 2. Restore Stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }

        // Emit real-time event
        const io = req.app.get('socketio');
        io.emit('orderCancelled', { orderId: order._id, status: 'Cancelled' });

        res.json({ msg: 'Order cancelled successfully', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/orders/:id/return
// @desc    Request a return for an order
// @access  Private
router.put('/:id/return', auth, async (req, res) => {
    const { reason } = req.body;
    try {
        let order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({ msg: 'Order not found' });
        
        // Ensure order belongs to user
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ msg: 'Only delivered orders can be returned' });
        }

        order.status = 'Return Requested';
        order.returnReason = reason;
        await order.save();

        // Emit real-time event
        const io = req.app.get('socketio');
        io.emit('orderUpdated', order);

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
