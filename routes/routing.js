const express = require("express");
const router = express.Router();
const usermodel = require("../model/Modelschema");

router.get("/", (req, res) => {
  const keyword = req.query.keyword;
  const query = keyword ? { productname: { $regex: keyword, $options: 'i' } } : {};

  usermodel.find(query)
    .then((result) => {
      console.log("Query result:", result);
      res.json(result);
    })
    .catch((err) => {
      console.error("Query error:", err); 
      res.status(500).json({ error: err.message }); 
    });
});


router.post("/Addproduct", (req, res) => {
  usermodel
    .create(req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.delete("/deleteproduct/:id", (req, res) => {
  const id = req.params.id;
  usermodel
    .findByIdAndDelete({ _id: id })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/getuser/:id", (req, res) => {
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

router.put("/updateuser/:id", async (req, res) => {
  const id = req.params.id;
  console.log('Update request for product:', id, 'with data:', req.body);
  
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
        reviewCount: req.body.reviewCount
      },
      { new: true } // Return updated document
    );
    
    console.log('Product updated successfully:', result);
    res.json(result);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
