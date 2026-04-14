const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const { runStartupValidation } = require('./utils/validateImages');

dotenv.config({ path: path.join(__dirname, '../.env') });


const app = express();

// Create public directory structure first
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const invoicesDir = path.join(__dirname, 'invoices');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Configure CORS first - Allow network access
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:5173',
    'http://192.168.2.210:5173',  // Your network IP
    /^http:\/\/192\.168\.\d+\.\d+:5173$/,  // Any IP in 192.168.x.x range
    /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,   // Any IP in 10.x.x.x range
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:5173$/ // Any IP in 172.16-31.x.x range
  ],
  credentials: true
}));

// Serve static files BEFORE other middleware
app.use('/uploads', express.static(uploadsDir));
app.use('/invoices', express.static(invoicesDir));

// Then other middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'B2B Marketplace API is running' });
});

// Debug endpoint to check images
app.get('/debug/images', async (req, res) => {
  try {
    const { Product } = require('./sequelize');
    const products = await Product.findAll({
      where: {
        images: { [require('sequelize').Op.ne]: null }
      },
      limit: 5,
      attributes: ['id', 'name', 'images']
    });
    
    const result = products.map(p => ({
      id: p.id,
      name: p.name,
      images_raw: p.images,
      images_parsed: (() => {
        try {
          return JSON.parse(p.images);
        } catch (e) {
          return 'Parse error: ' + e.message;
        }
      })()
    }));
    
    res.json({ products: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/retailer', require('./routes/retailer'));
app.use('/api/upload', require('./routes/upload'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to the database and sync models first
    await connectDB();
    const { sequelize } = require('./sequelize');
    await sequelize.sync();
    console.log('✅ Database models synced');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Run startup validation after the server is listening
      runStartupValidation();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
