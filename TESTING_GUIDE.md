# B2B E-commerce Platform Testing Guide

## 🚀 Quick Start

### 1. Database Setup
Your MongoDB connection string is already configured:
```
mongodb+srv://tejas:@Tejas2005@cluster0.1xv9uu9.mongodb.net/b2b-ecommerce?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Environment Setup
Create a `.env` file in the `server` directory with:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://tejas:@Tejas2005@cluster0.1xv9uu9.mongodb.net/b2b-ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
```

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Start the Application
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory, in new terminal)
npm run dev
```

## 🧪 Testing Procedures

### Backend API Testing

#### 1. Database Connection Test
```bash
cd server
node -e "require('./config/db.js')()"
```
Expected: "MongoDB Connected: cluster0.1xv9uu9.mongodb.net"

#### 2. API Endpoint Testing
```bash
cd server
node test-api.js
```

This will test:
- ✅ Database connection
- ✅ User registration
- ✅ User login
- ✅ Product creation
- ✅ Product retrieval
- ✅ Seller statistics
- ✅ Product update
- ✅ Product deletion

#### 3. Manual API Testing with Postman/curl

**Register a Seller:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Seller",
    "email": "seller@test.com",
    "password": "password123",
    "businessName": "Test Business",
    "businessType": "Manufacturing",
    "pincode": "123456",
    "phone": "1234567890",
    "whatsapp": "1234567890",
    "role": "seller"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@test.com",
    "password": "password123"
  }'
```

**Create Product (use token from login):**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "category": "electronics",
    "price": 100,
    "moq": 1,
    "unit": "pieces",
    "brand": "Test Brand",
    "leadTime": 7,
    "images": []
  }'
```

### Frontend Component Testing

#### 1. Component Structure Test
```bash
cd client
node test-components.js
```

This tests:
- ✅ AuthContext functionality
- ✅ API utility functions
- ✅ Form validation
- ✅ Dashboard components
- ✅ Product management
- ✅ Order management

#### 2. Manual Frontend Testing

**Test User Flows:**

1. **Seller Registration & Login:**
   - Go to http://localhost:5173/register
   - Register as a seller
   - Login and verify dashboard access

2. **Product Management:**
   - Navigate to seller dashboard
   - Click "List New Product"
   - Fill form and submit
   - Verify product appears in dashboard
   - Test edit functionality
   - Test delete functionality

3. **Retailer Registration & Shopping:**
   - Register as a retailer
   - Browse products
   - Place an order
   - Check order status

4. **Admin Dashboard:**
   - Register as admin
   - View platform statistics
   - Manage users
   - View all products and orders

## 🔍 Feature Testing Checklist

### Authentication & Authorization
- [ ] User registration (seller, retailer, admin)
- [ ] User login with correct credentials
- [ ] Login rejection with wrong credentials
- [ ] Token-based authentication
- [ ] Role-based access control
- [ ] Protected route access

### Product Management
- [ ] Create product with all fields
- [ ] Create product with validation errors
- [ ] View product list
- [ ] Search and filter products
- [ ] Edit product details
- [ ] Delete product
- [ ] Toggle product status (active/inactive)
- [ ] Image upload (if implemented)

### Order Management
- [ ] Place order as retailer
- [ ] View orders as seller
- [ ] Update order status (pending → processing → shipped → delivered)
- [ ] Cancel order
- [ ] View order history
- [ ] Order statistics

### Dashboard Analytics
- [ ] Seller dashboard shows correct stats
- [ ] Retailer dashboard shows order history
- [ ] Admin dashboard shows platform stats
- [ ] Charts and graphs display correctly
- [ ] Real-time data updates

### Data Integrity
- [ ] Input validation on all forms
- [ ] Server-side validation
- [ ] Error handling and user feedback
- [ ] Data persistence in database
- [ ] Proper data sanitization

## 🐛 Common Issues & Solutions

### Database Connection Issues
```bash
# Check MongoDB connection
mongosh "mongodb+srv://tejas:@Tejas2005@cluster0.1xv9uu9.mongodb.net/b2b-ecommerce"
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS Issues
- Ensure server is running on port 5000
- Check that client is making requests to correct API endpoints
- Verify CORS configuration in server/index.js

### Authentication Issues
- Check JWT_SECRET is set in environment
- Verify token is being sent in Authorization header
- Check token expiration

## 📊 Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery quick --count 10 --num 5 http://localhost:5000/api/products
```

### Database Performance
- Monitor MongoDB Atlas dashboard
- Check query performance
- Verify indexes are working

## 🎯 Success Criteria

### Backend Tests Should Pass:
- ✅ All API endpoints respond correctly
- ✅ Database operations work
- ✅ Authentication and authorization work
- ✅ Data validation works
- ✅ Error handling works

### Frontend Tests Should Pass:
- ✅ All components render correctly
- ✅ User interactions work
- ✅ Forms submit correctly
- ✅ Navigation works
- ✅ Data displays correctly

### Integration Tests Should Pass:
- ✅ Complete user workflows
- ✅ Data flows between frontend and backend
- ✅ Real-time updates work
- ✅ Error states are handled gracefully

## 🚀 Production Readiness

Before deploying to production:

1. **Security:**
   - [ ] Change JWT_SECRET to a secure random string
   - [ ] Set NODE_ENV=production
   - [ ] Enable HTTPS
   - [ ] Set up proper CORS origins

2. **Performance:**
   - [ ] Enable MongoDB indexes
   - [ ] Set up caching
   - [ ] Optimize images
   - [ ] Enable compression

3. **Monitoring:**
   - [ ] Set up error logging
   - [ ] Monitor database performance
   - [ ] Set up health checks
   - [ ] Monitor API response times

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB connection is working
4. Check that all environment variables are set
5. Review the error logs in the terminal

Your B2B e-commerce platform is now ready for testing and deployment! 🎉


