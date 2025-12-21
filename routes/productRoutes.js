const express = require("express");
const router = express.Router();
const usermodel = require("../model/Modelschema");

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

module.exports = router;
