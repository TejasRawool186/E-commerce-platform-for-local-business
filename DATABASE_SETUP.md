# Database Setup Instructions

## 🚨 Current Issue: MongoDB Atlas IP Whitelist

Your MongoDB Atlas cluster requires IP whitelisting. Here are the solutions:

### Option 1: Whitelist Your IP in MongoDB Atlas (Recommended)

1. **Go to MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com/
   - Login with your credentials

2. **Navigate to Network Access:**
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address"

3. **Add Your Current IP:**
   - Click "Add Current IP Address" (recommended)
   - Or add "0.0.0.0/0" for all IPs (less secure but easier for development)

4. **Wait for Changes:**
   - It may take a few minutes for changes to take effect

### Option 2: Use Local MongoDB (For Development)

If you want to use local MongoDB instead:

1. **Install MongoDB locally:**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb
   
   # Or download from: https://www.mongodb.com/try/download/community
   ```

2. **Update connection string in server/config/db.js:**
   ```javascript
   const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/b2b-ecommerce';
   ```

3. **Start MongoDB service:**
   ```bash
   # Windows
   net start MongoDB
   
   # Or run mongod directly
   mongod --dbpath C:\data\db
   ```

### Option 3: Use MongoDB Atlas with 0.0.0.0/0 (Development Only)

**⚠️ WARNING: This allows access from any IP - only use for development!**

1. Go to MongoDB Atlas → Network Access
2. Add IP Address → "Allow access from anywhere" (0.0.0.0/0)
3. This will allow connections from any IP address

## 🔧 Testing Database Connection

After setting up the database, test the connection:

```bash
cd server
node -e "require('./config/db.js')()"
```

Expected output:
```
MongoDB Connected: cluster0.1xv9uu9.mongodb.net
Database: b2b-ecommerce
```

## 🧪 Running the Full Test Suite

Once the database is connected:

```bash
# Test backend APIs
cd server
node test-api.js

# Test frontend components
cd ../client
node test-components.js
```

## 📊 Database Schema

Your application will create these collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  businessName: String,
  businessType: String,
  pincode: String,
  phone: String,
  whatsapp: String,
  role: String (seller|retailer|admin),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  sellerId: ObjectId (ref: User),
  name: String,
  description: String,
  category: String,
  price: Number,
  moq: Number,
  unit: String,
  brand: String,
  leadTime: Number,
  images: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  retailerId: ObjectId (ref: User),
  sellerId: ObjectId (ref: User),
  productId: ObjectId (ref: Product),
  quantity: Number,
  unitPrice: Number,
  totalAmount: Number,
  status: String (pending|processing|shipped|delivered|cancelled),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Next Steps

1. **Fix IP Whitelist** (choose one option above)
2. **Test Database Connection**
3. **Run Full Test Suite**
4. **Start the Application**

```bash
# Start server
cd server
npm run dev

# Start client (in new terminal)
cd client
npm run dev
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Could not connect to any servers"**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string is correct
   - Check network connectivity

2. **"Authentication failed"**
   - Verify username and password in connection string
   - Check if user has proper permissions

3. **"Database not found"**
   - This is normal - MongoDB will create the database when first used
   - Collections will be created automatically

4. **"Connection timeout"**
   - Check if MongoDB Atlas cluster is running
   - Verify network access settings

## 📞 Support

If you continue to have issues:
1. Check MongoDB Atlas cluster status
2. Verify your IP address is whitelisted
3. Test with a simple connection script
4. Check MongoDB Atlas logs for errors

Your database setup is almost complete! 🎉


