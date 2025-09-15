# LocalB2B - B2B Marketplace Platform

A comprehensive B2B marketplace platform that connects local sellers and retailers, built with React, Express.js, and MongoDB.

## Features

### 🏪 **Multi-Role System**
- **Sellers**: List products, manage orders, track sales
- **Retailers**: Browse products, place orders, track purchases  
- **Admins**: Manage users, monitor platform activity

### 🛍️ **Product Management**
- Product listing with multiple images
- Category-based organization
- Search and filtering capabilities
- Location-based supplier discovery

### 📦 **Order Management**
- Order placement with MOQ validation
- Status tracking (pending, processing, shipped, delivered)
- Direct communication with suppliers

### 🔐 **Authentication & Security**
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation with Zod

### 📊 **Analytics & Reporting**
- Sales charts and statistics
- Order status breakdowns
- User activity monitoring

## Technology Stack

### Frontend
- **React 18** with JavaScript
- **Vite** for build tooling
- **Wouter** for routing
- **TanStack Query** for state management
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Chart.js** for analytics

### Backend
- **Express.js** with JavaScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Express Validator** for input validation

## Quick Start

### Windows Users
```bash
# Clone the repository
git clone <repository-url>
cd localb2b

# Run the setup script
npm run setup

# Start both server and client
start-all.bat
```

### Other Platforms
```bash
# Clone and setup
git clone <repository-url>
cd localb2b
npm run setup

# Create .env file in server directory with MongoDB connection
# Start the application
npm run dev
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd localb2b
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/localb2b
JWT_SECRET=your-super-secret-jwt-key-here-123456789
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important**: Make sure to change the JWT_SECRET to a secure random string in production!

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the database and collections.

### 5. Start the Application

#### Development Mode (Recommended)
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 5173) concurrently.

#### Manual Start
```bash
# Start backend server
cd server
npm run dev

# Start frontend (in a new terminal)
cd client
npm run dev
```

### 6. Create Admin User (Optional)
```bash
npm run seed
```
This creates an admin user with:
- Email: admin@localb2b.com
- Password: admin123

**Important**: Change the password after first login!

### 7. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Usage Guide

### Getting Started

1. **Register an Account**
   - Choose your role (Seller or Retailer)
   - Fill in business details
   - Verify your information

2. **For Sellers**
   - Access your dashboard
   - List new products with images
   - Manage orders and track sales
   - View analytics and reports

3. **For Retailers**
   - Browse products by category
   - Search by location (pincode)
   - Place orders with quantity validation
   - Track order status
   - Contact suppliers directly

4. **For Admins**
   - Monitor platform statistics
   - Manage user accounts
   - Activate/deactivate users
   - View system analytics

### Key Features

#### Product Listing
- Upload up to 5 product images
- Set pricing and minimum order quantities
- Add detailed descriptions
- Specify lead times and brands

#### Order Management
- MOQ validation prevents invalid orders
- Real-time status updates
- Direct communication with suppliers
- Order history tracking

#### Search & Discovery
- Text-based product search
- Category filtering
- Location-based supplier discovery
- Price range filtering

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get products with filters
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create order (retailers only)
- `GET /api/retailer/orders` - Get retailer orders
- `GET /api/seller/orders` - Get seller orders
- `PUT /api/orders/:id/status` - Update order status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

### Upload
- `POST /api/upload/images` - Upload product images
- `DELETE /api/upload/images/:filename` - Delete image

## Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (seller/retailer/admin),
  firstName: String,
  lastName: String,
  businessName: String,
  businessType: String (for sellers),
  address: String,
  pincode: String,
  phone: String,
  whatsapp: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  sellerId: ObjectId,
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
  retailerId: ObjectId,
  sellerId: ObjectId,
  productId: ObjectId,
  quantity: Number,
  unitPrice: Number,
  totalAmount: Number,
  status: String,
  orderDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Project Structure
```
localb2b/
├── server/                 # Backend Express.js application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File upload directory
│   └── index.js           # Server entry point
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.jsx        # Main app component
│   └── public/            # Static assets
└── package.json           # Root package.json
```

### Available Scripts

#### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

#### Server
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

#### Client
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Deployment

### Environment Variables
Set the following environment variables for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d
```

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

#### PowerShell Execution Policy Error
If you encounter PowerShell execution policy errors on Windows:
```bash
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### MongoDB Connection Issues
- Make sure MongoDB is running on your system
- Check if the connection string in `.env` is correct
- For MongoDB Atlas, use the connection string provided in your dashboard

#### Port Already in Use
If ports 5000 or 5173 are already in use:
- Change the PORT in `server/.env` file
- Update the proxy configuration in `client/vite.config.js`

#### Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Windows-Specific Setup
If you're having issues with the setup on Windows, you can use the provided batch files:

1. **start-all.bat** - Starts both server and client
2. **start-server.bat** - Starts only the server
3. **start-client.bat** - Starts only the client

## Support

For support and questions, please contact the development team or create an issue in the repository.
