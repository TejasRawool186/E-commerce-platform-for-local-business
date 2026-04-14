const jwt = require('jsonwebtoken');
const { User } = require('../sequelize');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle special case for hardcoded admin user
    if (decoded.id === 'admin-001' && decoded.role === 'admin') {
      req.user = { id: 'admin-001', role: 'admin' };
      return next();
    }

    // Get user from the token for regular users
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
