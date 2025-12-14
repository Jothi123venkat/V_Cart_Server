const express = require('express');
const router = express.Router();
const User = require('../model/User');
const auth = require('../middleware/authMiddleware');
// const Product = require('../model/Modelschema'); // for wishlist reference check

// --- USER ROUTES ---

// @route   GET api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, phone, notifications } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.notifications = notifications || user.notifications;

    user.activityLog.push({
        action: 'update_profile',
        details: 'Updated profile details'
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/user/address
// @desc    Add new address
// @access  Private
router.post('/address', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    user.activityLog.push({ action: 'add_address', details: `Added address: ${req.body.label}` });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/user/address/:id
// @desc    Delete addres
// @access  Private
router.delete('/address/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/user/wishlist/:id
// @desc    Toggle wishlist item
// @access  Private
router.post('/wishlist/:id', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const index = user.wishlist.indexOf(req.params.id);
      
      if (index === -1) {
          user.wishlist.push(req.params.id); // Add
      } else {
          user.wishlist.splice(index, 1); // Remove
      }
      
      await user.save();
      // Populate wishlist before returning
      // await user.populate('wishlist').execPopulate(); // Syntax depends on mongoose version
      res.json(user.wishlist);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// --- ADMIN ROUTES ---

// @route   GET api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Needs Admin Check ideal, using generic auth for now)
router.get('/admin/users', auth, async (req, res) => {
    try {
        // In real app, check if req.user.role === 'admin'
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/admin/users/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({ msg: 'User not found' });
        
        user.status = status;
        user.activityLog.push({ action: 'admin_status_change', details: `Status changed to ${status}` });
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/users/create
// @desc    Create a new user (Admin)
// @access  Private
router.post('/admin/users/create', auth, async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            activityLog: [{ action: 'admin_created', details: 'Account created by admin' }]
        });

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
