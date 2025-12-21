const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema Definition (Inline for simplicity or could be in model file)
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
});
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Get all
router.get('/', async (req, res) => {
    const cats = await Category.find();
    res.json(cats);
});

// Create
router.post('/', async (req, res) => {
    const newCat = new Category(req.body);
    await newCat.save();
    res.json(newCat);
});

// Update
router.put('/:id', async (req, res) => {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// Delete
router.delete('/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

module.exports = router;
