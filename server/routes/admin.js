const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, toggleUserActive, getStats, getRecentActivity } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

router.get('/users', protect, adminOnly, getUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.patch('/users/:id/toggle', protect, adminOnly, toggleUserActive);
router.get('/stats', protect, adminOnly, getStats);
router.get('/activity', protect, adminOnly, getRecentActivity);

module.exports = router;
