const mongoose = require('mongoose');

const dbStatus = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database not connected",
      tip: "Please ensure your MongoDB service is running or check your connection string."
    });
  }
  next();
};

module.exports = dbStatus;
