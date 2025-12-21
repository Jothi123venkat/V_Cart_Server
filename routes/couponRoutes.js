const express = require('express');
const router = express.Router();
const Coupon = require('../model/Coupon');
const auth = require('../middleware/authMiddleware');

// Get all coupons (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ _id: -1 });
        res.json(coupons);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Create Coupon (Admin only)
router.post('/', auth, async (req, res) => {
    const { code, discount, type, expiryDate, minPurchase, usageLimit } = req.body;
    try {
        let coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (coupon) {
            return res.status(400).json({ message: 'Coupon already exists' });
        }

        coupon = new Coupon({
            code: code.toUpperCase(),
            discount,
            type,
            expiryDate,
            minPurchase,
            usageLimit
        });

        await coupon.save();

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('newCoupon', coupon);

        res.status(201).json(coupon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Coupon (Admin only)
router.put('/:id', auth, async (req, res) => {
    const { active, discount, type, expiryDate, minPurchase, usageLimit } = req.body;
    try {
        let coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });

        if (active !== undefined) coupon.active = active;
        if (discount) coupon.discount = discount;
        if (type) coupon.type = type;
        if (expiryDate) coupon.expiryDate = expiryDate;
        if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit;

        await coupon.save();

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('couponUpdated', coupon);

        res.json(coupon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete Coupon (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });

        await Coupon.findByIdAndDelete(req.params.id);

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('couponDeleted', req.params.id);

        res.json({ msg: 'Coupon removed', id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Validate Coupon (Public/User)
router.post('/validate', async (req, res) => {
    const { code, subtotal } = req.body;
    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
        
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
            return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minPurchase} required` });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        res.json({
            code: coupon.code,
            discount: coupon.discount,
            type: coupon.type,
            message: 'Coupon applied successfully!'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
