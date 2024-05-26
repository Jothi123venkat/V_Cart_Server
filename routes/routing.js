const express = require("express");
const router = express.Router();
const usermodel = require("../model/Modelschema");

router.get("/", (req, res) => {
  usermodel
    .find({})
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
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

router.put("/updateuser/:id", (req, res) => {
  const id = req.params.id;
  usermodel
    .findByIdAndUpdate(
      { _id: id },
      {
        productname: req.body.updateproductname,
        productdescription: req.body.updateproductDescription,
        price: req.body.updateprice,
      }
    )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json;
    });
});

module.exports = router;
