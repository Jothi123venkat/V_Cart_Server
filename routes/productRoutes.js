const express = require("express");
const router = express.Router();
const usermodel = require("../model/Modelschema");
const Review = require("../model/Review");
const auth = require("../middleware/authMiddleware");

// GET all products
router.get("/", (req, res) => {
  const keyword = req.query.keyword;
  const query = keyword ? { productname: { $regex: keyword, $options: 'i' } } : {};

  usermodel.find(query)
    .then((result) => {
      console.log("Products retrieved:", result.length);
      res.json(result);
    })
    .catch((err) => {
      console.error("Query error:", err); 
      res.status(500).json({ error: err.message }); 
    });
});

// GET single product
router.get("/:id", (req, res) => {
  const id = req.params.id;
  usermodel
    .findById({ _id: id })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

// POST add product
router.post("/", (req, res) => {
  usermodel
    .create(req.body)
    .then((result) => {
      console.log("Product added:", result._id);
      res.json(result);
    })
    .catch((err) => {
      console.error("Add error:", err);
      res.status(500).json(err);
    });
});

// PUT update product
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  console.log('Update request for product:', id);
  
  try {
    const result = await usermodel.findByIdAndUpdate(
      { _id: id },
      {
        productname: req.body.productname,
        productdescription: req.body.productdescription,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        ImageURL: req.body.ImageURL,
        rating: req.body.rating,
        reviewCount: req.body.reviewCount,
        material: req.body.material,
        colors: req.body.colors,
        sizes: req.body.sizes
      },
      { new: true }
    );
    
    console.log('Product updated successfully:', result._id);
    res.json(result);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  usermodel
    .findByIdAndDelete({ _id: id })
    .then((result) => {
      console.log("Product deleted:", id);
      res.json(result);
    })
    .catch((err) => {
      console.error("Delete error:", err);
      res.status(500).json(err);
    });
});

// @route   GET api/products/:id/reviews
// @desc    Get reviews for a product
// @access  Public
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST api/products/:id/reviews
// @desc    Add a review for a product
// @access  Private
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, comment, name, orderId } = req.body;

  try {
    const product = await usermodel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: req.params.id,
      user: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = new Review({
      name: name || req.user.name, 
      rating: Number(rating),
      comment,
      user: req.user.id,
      product: req.params.id
    });

    await review.save();

    // Update product rating and reviewCount
    const reviews = await Review.find({ product: req.params.id });
    product.reviewCount = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    // If orderId is provided, mark the item as reviewed in that order
    if (orderId) {
        const Order = require("../model/Order");
        await Order.updateOne(
            { _id: orderId, "items.productId": req.params.id },
            { $set: { "items.$.isReviewed": true } }
        );
    }

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
