const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'dha_estate_pro_super_secret_jwt_key_2026', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ message: 'User account not found' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles`
      });
    }

    next();
  };
};

// Optional authentication for public reads: populates req.user when a
// valid token is supplied, but never rejects the request. Used so public
// listing reads can hide unverified listings while owners/admins still
// see their own pending listings.
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dha_estate_pro_super_secret_jwt_key_2026'
    );
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (user) req.user = user;
  } catch (_) {
    // Invalid/expired token on a public route: continue anonymously.
  }
  next();
};

module.exports = {
  authenticateToken,
  checkRole,
  optionalAuth
};
