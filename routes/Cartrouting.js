const express = require("express");
const cartrouter = express.Router();

const cartmodel = require("../model/Cart");

cartrouter.get("/getcart", (req, res) => {
  cartmodel
    .find({})
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

cartrouter.post("/addcart", (req, res) => {
  cartmodel
    .create(req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

cartrouter.delete("/deletecart/:id", (req, res) => {
  const id = req.params.id;
  cartmodel
    .findByIdAndDelete({ _id: id })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

module.exports = cartrouter;
