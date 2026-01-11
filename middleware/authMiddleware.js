const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key-123'; // Same as in authRoutes.js

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check for token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Add user from payload
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
