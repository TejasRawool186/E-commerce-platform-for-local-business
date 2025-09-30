const mongoose = require('mongoose');

// Test with local MongoDB first
const testLocalConnection = async () => {
  try {
    console.log('🔍 Testing local MongoDB connection...');
    const conn = await mongoose.connect('mongodb://localhost:27017/b2b-ecommerce-test');
    console.log('✅ Local MongoDB Connected:', conn.connection.host);
    console.log('✅ Database:', conn.connection.name);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Local MongoDB connection failed:', error.message);
    return false;
  }
};

// Test with Atlas MongoDB
const testAtlasConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    const conn = await mongoose.connect('mongodb+srv://tejas:%40Tejas2005@cluster0.1xv9uu9.mongodb.net/b2b-ecommerce?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB Atlas Connected:', conn.connection.host);
    console.log('✅ Database:', conn.connection.name);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ MongoDB Atlas connection failed:', error.message);
    return false;
  }
};

// Test database operations
const testDatabaseOperations = async () => {
  try {
    console.log('🔍 Testing database operations...');
    
    // Connect to database
    const conn = await mongoose.connect('mongodb://localhost:27017/b2b-ecommerce-test');
    
    // Define a simple test schema
    const testSchema = new mongoose.Schema({
      name: String,
      email: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Test CRUD operations
    console.log('  - Testing CREATE...');
    const testDoc = new TestModel({ name: 'Test User', email: 'test@example.com' });
    await testDoc.save();
    console.log('  ✅ CREATE successful');
    
    console.log('  - Testing READ...');
    const foundDoc = await TestModel.findOne({ email: 'test@example.com' });
    if (foundDoc) {
      console.log('  ✅ READ successful');
    } else {
      throw new Error('Document not found');
    }
    
    console.log('  - Testing UPDATE...');
    foundDoc.name = 'Updated Test User';
    await foundDoc.save();
    console.log('  ✅ UPDATE successful');
    
    console.log('  - Testing DELETE...');
    await TestModel.deleteOne({ _id: foundDoc._id });
    console.log('  ✅ DELETE successful');
    
    // Cleanup
    await mongoose.disconnect();
    console.log('✅ All database operations successful');
    return true;
  } catch (error) {
    console.log('❌ Database operations failed:', error.message);
    return false;
  }
};

// Main test function
const runDatabaseTests = async () => {
  console.log('🚀 Starting Database Connection Tests\n');
  
  let localSuccess = false;
  let atlasSuccess = false;
  
  // Test local MongoDB first
  localSuccess = await testLocalConnection();
  console.log('');
  
  // Test Atlas MongoDB
  atlasSuccess = await testAtlasConnection();
  console.log('');
  
  if (localSuccess) {
    console.log('🧪 Testing database operations with local MongoDB...');
    const operationsSuccess = await testDatabaseOperations();
    console.log('');
    
    if (operationsSuccess) {
      console.log('🎉 Local MongoDB is working perfectly!');
      console.log('📝 You can use local MongoDB for development');
      console.log('💡 To use Atlas MongoDB, whitelist your IP address');
    }
  } else if (atlasSuccess) {
    console.log('🎉 MongoDB Atlas is working!');
    console.log('📝 You can use Atlas MongoDB for your application');
  } else {
    console.log('❌ Both local and Atlas connections failed');
    console.log('📝 Please check:');
    console.log('  1. MongoDB is installed locally, OR');
    console.log('  2. Your IP is whitelisted in MongoDB Atlas');
    console.log('  3. Your internet connection is working');
  }
  
  console.log('\n📊 Test Results:');
  console.log(`Local MongoDB: ${localSuccess ? '✅ Working' : '❌ Failed'}`);
  console.log(`MongoDB Atlas: ${atlasSuccess ? '✅ Working' : '❌ Failed'}`);
};

// Run tests
runDatabaseTests().catch(console.error);


