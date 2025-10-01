const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { email, password, role, username, businessName, address, phoneNumber } = req.body;

    if (!email || !password || !role || !username) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    if (!['retailer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        role,
        username,
        business_name: businessName || null,
        address: address || null,
        phone_number: phoneNumber || null
      })
      .select()
      .single();

    if (error) throw error;

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
        username: user.username,
        businessName: user.business_name
      },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
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
        username: user.username,
        businessName: user.business_name
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
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, username, business_name, address, phone_number, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      businessName: user.business_name,
      address: user.address,
      phoneNumber: user.phone_number,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: err.message });
  }
};
