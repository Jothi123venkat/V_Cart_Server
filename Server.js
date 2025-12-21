const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cartrouter = require("./routes/Cartrouting");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");
const seedRoutes = require("./routes/seedRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const couponRouter = require("./routes/couponRoutes");

dotenv.config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Attach io to req
app.set('socketio', io);

// Routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartrouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupons", couponRouter);
app.use("/api", seedRoutes);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/AddProduct")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

server.listen(port, () => {
  console.log(`Server is running successfully on port ${port}`);
});
