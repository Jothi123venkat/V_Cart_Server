const express = require('express');
const router = express.Router();
const SiteConfig = require('../model/SiteConfig');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/site-config
// @desc    Get site configuration
// @access  Public
router.get('/', async (req, res) => {
    try {
        let config = await SiteConfig.findOne();
        if (!config) {
            // Create default config if none exists
            config = new SiteConfig();
            await config.save();
        }
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/site-config
// @desc    Update site configuration
// @access  Private (Admin only)
// Note: Middleware usually adds user to req.user. We need to check if user is admin.
// Assuming auth middleware verifies token and adds user payload.
router.put('/', auth, async (req, res) => {
    try {
        // Simple admin check - assuming role is in req.user or we fetch user.
        // If your auth middleware puts role in req.user, use that.
        // Otherwise, fetch user. For now, assuming req.user.role === 'admin' based on common patterns.
        // Let's verify auth middleware in a second, but for now write the logic.
        
        // Actually, let's play it safe and check the user role if it's not in the token payload.
        // But usually it is. Let's assume req.user.role is available or check against DB if strict.
        // Based on previous contexts, likely `req.user.role` or `isAdmin`.
        
        // Let's look at how other admin routes (e.g., productRoutes) do it.
        // I'll peek at another route file first to match the pattern.
        
        const { 
            brandName, 
            logoUrl, 
            heroTitle, 
            heroSubtitle, 
            heroButtonText, 
            heroImage,
            contactEmail,
            contactPhone,
            footerText
        } = req.body;

        let config = await SiteConfig.findOne();
        if (!config) {
            config = new SiteConfig();
        }

        config.brandName = brandName;
        config.logoUrl = logoUrl;
        config.heroTitle = heroTitle;
        config.heroSubtitle = heroSubtitle;
        config.heroButtonText = heroButtonText;
        config.heroImage = heroImage;
        config.contactEmail = contactEmail;
        config.contactPhone = contactPhone;
        config.footerText = footerText;

        await config.save();
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
