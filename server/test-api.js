const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  businessName: 'Test Business',
  businessType: 'Retail',
  pincode: '123456',
  phone: '1234567890',
  whatsapp: '1234567890',
  role: 'seller'
};

const testProduct = {
  name: 'Test Product',
  description: 'This is a test product',
  category: 'electronics',
  price: 100,
  moq: 1,
  unit: 'pieces',
  brand: 'Test Brand',
  leadTime: 7,
  images: []
};

let authToken = '';
let productId = '';
let orderId = '';

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test functions
const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  const result = await apiCall('GET', '/');
  if (result.success) {
    console.log('✅ Database connection successful');
    return true;
  } else {
    console.log('❌ Database connection failed:', result.error);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('🔍 Testing user registration...');
  const result = await apiCall('POST', '/auth/register', testUser);
  if (result.success) {
    console.log('✅ User registration successful');
    return true;
  } else {
    console.log('❌ User registration failed:', result.error);
    return false;
  }
};

const testUserLogin = async () => {
  console.log('🔍 Testing user login...');
  const result = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  if (result.success) {
    authToken = result.data.token;
    console.log('✅ User login successful');
    return true;
  } else {
    console.log('❌ User login failed:', result.error);
    return false;
  }
};

const testProductCreation = async () => {
  console.log('🔍 Testing product creation...');
  const result = await apiCall('POST', '/products', testProduct, authToken);
  if (result.success) {
    productId = result.data.product._id;
    console.log('✅ Product creation successful');
    return true;
  } else {
    console.log('❌ Product creation failed:', result.error);
    return false;
  }
};

const testProductRetrieval = async () => {
  console.log('🔍 Testing product retrieval...');
  const result = await apiCall('GET', '/products');
  if (result.success) {
    console.log('✅ Product retrieval successful');
    return true;
  } else {
    console.log('❌ Product retrieval failed:', result.error);
    return false;
  }
};

const testSellerStats = async () => {
  console.log('🔍 Testing seller stats...');
  const result = await apiCall('GET', '/seller/stats', null, authToken);
  if (result.success) {
    console.log('✅ Seller stats successful');
    return true;
  } else {
    console.log('❌ Seller stats failed:', result.error);
    return false;
  }
};

const testProductUpdate = async () => {
  console.log('🔍 Testing product update...');
  const updatedProduct = { ...testProduct, name: 'Updated Test Product' };
  const result = await apiCall('PUT', `/seller/products/${productId}`, updatedProduct, authToken);
  if (result.success) {
    console.log('✅ Product update successful');
    return true;
  } else {
    console.log('❌ Product update failed:', result.error);
    return false;
  }
};

const testProductDeletion = async () => {
  console.log('🔍 Testing product deletion...');
  const result = await apiCall('DELETE', `/seller/products/${productId}`, null, authToken);
  if (result.success) {
    console.log('✅ Product deletion successful');
    return true;
  } else {
    console.log('❌ Product deletion failed:', result.error);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting B2B E-commerce Platform Tests\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Product Creation', fn: testProductCreation },
    { name: 'Product Retrieval', fn: testProductRetrieval },
    { name: 'Seller Stats', fn: testSellerStats },
    { name: 'Product Update', fn: testProductUpdate },
    { name: 'Product Deletion', fn: testProductDeletion }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
    console.log(''); // Empty line for readability
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your B2B e-commerce platform is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };


