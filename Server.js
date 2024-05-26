const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/routing");
const cartrouter = require("./routes/Cartrouting")
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 5000;

const app = express();

// Use express.json() middleware to parse JSON bodies
app.use(express.json({
  limit: '100mb' // Adjust the limit as needed
}));

// Use cors middleware
app.use(cors());

// Use bodyParser middleware for parsing form data
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Use the router middleware
app.use("/", router);
app.use("/cart", cartrouter);


// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/AddProduct");

const database = mongoose.connection;

database.on("connected", () => console.log("Database connected"));
database.on("error", (err) => console.log(err));

app.listen(port, () => {
  console.log("Server is running successfully");
});
