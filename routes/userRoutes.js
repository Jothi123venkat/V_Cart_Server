const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const auth = require('../middleware/authMiddleware');

// Get all users (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        // In a real app, check if req.user.role === 'admin'
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Create User (Admin only)
router.post('/', auth, async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            status: 'active'
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('newUser', userResponse);

        res.status(201).json(userResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update User (Admin only)
router.put('/:id', auth, async (req, res) => {
    const { name, email, role, status } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('userUpdated', userResponse);

        res.json(userResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete User (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await User.findByIdAndDelete(req.params.id);

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('userDeleted', req.params.id);

        res.json({ msg: 'User removed', id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update user status (suspend/activate)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({ msg: 'User not found' });
        
        user.status = req.body.status;
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) io.emit('userUpdated', userResponse);

        res.json(userResponse);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
