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
const ticketRouter = require("./routes/ticketRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const profileRouter = require("./routes/profileRoutes");

dotenv.config();

// Disable buffering so queries fail fast if DB is down
mongoose.set('bufferCommands', false);

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 5000;

const dbStatus = require("./middleware/dbStatus");

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply database status check to all API routes
app.use("/api", dbStatus);

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
app.use("/api/tickets", ticketRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/profile", profileRouter);
app.use("/api/address", profileRouter);
app.use("/api/config", require("./routes/siteConfigRoutes"));
app.use("/api", seedRoutes);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AddProduct";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 10000,
})
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.group("❌ Database connection error:");
    console.error(`Message: ${err.message}`);
    console.error(`Status: ${mongoose.connection.readyState === 0 ? 'Disconnected' : 'Connecting...'}`);
    if (err.message.includes("ECONNREFUSED")) {
      console.warn("\nACTION REQUIRED:");
      console.warn("1. Open Windows Services (services.msc)");
      console.warn("2. Find 'MongoDB Server'");
      console.warn("3. Right-click and choose 'Start'");
      console.warn("--- OR ---");
      console.warn("Use MongoDB Atlas and update MONGO_URI in .env");
    }
    console.groupEnd();
  });

server.listen(port, () => {
  console.log(`Server is running successfully on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${port} is already in use.`);
    console.warn(`TIP: Another instance of the server is likely running. Try killing it or using a different PORT in .env`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});
