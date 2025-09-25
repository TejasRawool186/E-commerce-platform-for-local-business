const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, businessName, businessType, address, pincode, phone, whatsapp } = req.body;
    if (!email || !password || !role || !firstName || !lastName || !address || !pincode) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      businessName,
      businessType: role === 'seller' ? businessType : undefined,
      address,
      pincode,
      phone,
      whatsapp
    });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
