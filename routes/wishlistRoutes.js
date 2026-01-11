const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Product = require('../model/Modelschema'); // This exports as 'productlist' model
const auth = require('../middleware/authMiddleware');

// GET /api/wishlist - Fetch user's wishlist with populated product details
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out any null products (in case products were deleted)
        const validWishlist = user.wishlist.filter(product => product !== null);
        
        res.json({ wishlist: validWishlist });
    } catch (err) {
        console.error('Wishlist fetch error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/wishlist/:productId - Toggle product in wishlist (add/remove)
router.post('/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if product is already in wishlist
        const productIndex = user.wishlist.indexOf(productId);
        
        if (productIndex > -1) {
            // Product exists, remove it
            user.wishlist.splice(productIndex, 1);
            await user.save();
            return res.json({ 
                message: 'Product removed from wishlist',
                wishlist: user.wishlist,
                action: 'removed'
            });
        } else {
            // Product doesn't exist, add it
            user.wishlist.push(productId);
            await user.save();
            return res.json({ 
                message: 'Product added to wishlist',
                wishlist: user.wishlist,
                action: 'added'
            });
        }
    } catch (err) {
        console.error('Wishlist toggle error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove product from wishlist
        const productIndex = user.wishlist.indexOf(productId);
        
        if (productIndex > -1) {
            user.wishlist.splice(productIndex, 1);
            await user.save();
            res.json({ 
                message: 'Product removed from wishlist',
                wishlist: user.wishlist
            });
        } else {
            res.status(404).json({ message: 'Product not in wishlist' });
        }
    } catch (err) {
        console.error('Wishlist remove error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
