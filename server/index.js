const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});


// Auth routes
app.use('/api/auth', require('./routes/auth'));
// Product routes
app.use('/api/products', require('./routes/product'));
// Order routes
app.use('/api/orders', require('./routes/order'));
// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Seller specific routes
app.use('/api/seller', require('./routes/seller'));
// Retailer specific routes  
app.use('/api/retailer', require('./routes/retailer'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Initialize models and sync
    require('./sequelize');
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error('Startup error:', e);
    process.exit(1);
  }
}

start();
