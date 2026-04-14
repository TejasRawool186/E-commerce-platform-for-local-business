const { User } = require('../sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, businessName, address, pincode, phoneNumber } = req.body;

    if (!email || !password || !role || !firstName || !lastName || !address || !pincode) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    if (!['retailer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      businessName: businessName || null,
      address,
      pincode,
      phone: phoneNumber || null
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Check for hardcoded admin credentials
    if (email === 'admin@localb2b.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'admin-001', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        user: {
          id: 'admin-001',
          email: 'admin@localb2b.com',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          businessName: 'LocalB2B Admin'
        },
        token
      });
    }

    // For regular users, check database
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // Check if it's the hardcoded admin user
    if (req.user.id === 'admin-001' && req.user.role === 'admin') {
      return res.json({
        id: 'admin-001',
        email: 'admin@localb2b.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        businessName: 'LocalB2B Admin',
        address: 'Admin Office',
        phoneNumber: null,
        createdAt: new Date().toISOString()
      });
    }

    // For regular users, check database
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'firstName', 'lastName', 'businessName', 'address', 'phone', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      address: user.address,
      phoneNumber: user.phone,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { firstName, lastName, businessName, address, pincode, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.businessName = businessName || user.businessName;
    user.address = address || user.address;
    user.pincode = pincode || user.pincode;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        address: user.address,
        pincode: user.pincode,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: err.message });
  }
};
