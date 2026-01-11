const express = require('express');
const router = express.Router();
const User = require('../model/User');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/address
// @desc    Get user addresses
// @access  Private
router.get('/addresses', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('addresses');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.addresses || []);
    } catch (err) {
        console.error('Address fetch error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/profile/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', auth, async (req, res) => {
    try {
        const { label, street, city, state, zip, country, isDefault } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If this is the first address, make it default automatically
        const shouldBeDefault = user.addresses.length === 0 || isDefault;

        // If setting as default, unset other defaults
        if (shouldBeDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({ label, street, city, state, zip, country, isDefault: shouldBeDefault });
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error('Address add error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   PUT /api/profile/addresses/:id/default
// @desc    Set address as default
// @access  Private
router.put('/addresses/:id/default', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Unset all other defaults
        user.addresses.forEach(addr => addr.isDefault = false);
        
        // Set this address as default
        address.isDefault = true;
        
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error('Set default address error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/address/:id
// @desc    Update address
// @access  Private
router.put('/addresses/:id', auth, async (req, res) => {
    try {
        const { label, street, city, state, zip, country, isDefault } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        if (label !== undefined) address.label = label;
        if (street !== undefined) address.street = street;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (zip !== undefined) address.zip = zip;
        if (country !== undefined) address.country = country;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.json(user.addresses);
    } catch (err) {
        console.error('Address update error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/address/:id
// @desc    Delete address
// @access  Private
router.delete('/addresses/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.pull(req.params.id);
        await user.save();

        res.json(user.addresses);
    } catch (err) {
        console.error('Address delete error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
