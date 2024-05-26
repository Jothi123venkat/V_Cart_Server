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

module.exports = router;
