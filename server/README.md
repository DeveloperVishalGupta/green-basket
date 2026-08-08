# Green Basket Backend API

Complete backend API for Green Basket E-commerce Platform built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
The `.env` file has been created with default values. Update these values:

```env
# Required - Update these
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

# Optional - Update if using Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Start the server:**

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model with auth
│   │   ├── Product.js           # Product model
│   │   ├── Category.js          # Category model
│   │   ├── Cart.js              # Shopping cart model
│   │   └── Order.js             # Order model
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── productController.js # Product CRUD
│   │   ├── categoryController.js# Category CRUD
│   │   ├── cartController.js    # Cart operations
│   │   └── orderController.js   # Order management
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── user.routes.js       # User endpoints
│   │   ├── product.routes.js    # Product endpoints
│   │   ├── category.routes.js   # Category endpoints
│   │   ├── cart.routes.js       # Cart endpoints
│   │   └── order.routes.js      # Order endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validate.js          # Request validation
│   │   └── errorHandler.js      # Global error handler
│   ├── utils/
│   │   └── jwt.js               # JWT utilities
│   └── index.js                 # Server entry point
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are sent in:
1. HTTP-only cookies (recommended)
2. Authorization header: `Bearer <token>`

### Authentication Flow

1. **Register** → Receive OTP
2. **Verify OTP** → Get JWT token
3. **Use token** for authenticated requests

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

### 🔑 Authentication Routes (`/api/auth`)

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}

Response: {
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "...",
    "email": "john@example.com",
    "otp": "123456" // Only in development
  }
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response: {
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": { user details }
}
```

---

### 👤 User Routes (`/api/users`)

All user routes require authentication.

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

#### Get All Addresses
```http
GET /api/users/addresses
Authorization: Bearer <token>
```

#### Add New Address
```http
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Home",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

#### Update Address
```http
PUT /api/users/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Office",
  "street": "456 Work Ave"
}
```

#### Delete Address
```http
DELETE /api/users/addresses/:addressId
Authorization: Bearer <token>
```

#### Set Default Address
```http
PUT /api/users/addresses/:addressId/default
Authorization: Bearer <token>
```

---

### 📦 Product Routes (`/api/products`)

#### Get All Products (Public)
```http
GET /api/products?page=1&limit=12&category=xyz&minPrice=10&maxPrice=100&search=shirt&isFeatured=true&sort=-createdAt

Response: {
  "success": true,
  "data": [ products ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "pages": 4
  }
}
```

#### Get Product by Slug (Public)
```http
GET /api/products/:slug

Response: {
  "success": true,
  "data": { product details }
}
```

#### Get Product by ID (Public)
```http
GET /api/products/id/:productId
```

#### Create Product (Admin/Vendor)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 29.99,
  "compareAtPrice": 49.99,
  "category": "category_id",
  "stock": 100,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Product image"
    }
  ],
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Red", "Blue", "Black"],
  "tags": ["cotton", "casual", "summer"]
}
```

#### Update Product (Admin/Vendor - Owner)
```http
PUT /api/products/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 24.99,
  "stock": 150
}
```

#### Delete Product (Admin)
```http
DELETE /api/products/:productId
Authorization: Bearer <token>
```

#### Toggle Featured Status (Admin)
```http
PUT /api/products/:productId/featured
Authorization: Bearer <token>
```

---

### 🏷️ Category Routes (`/api/categories`)

#### Get All Categories (Public)
```http
GET /api/categories?parent=null&includeInactive=false

Response: {
  "success": true,
  "data": [ categories ]
}
```

#### Get Category by Slug (Public)
```http
GET /api/categories/:slug
```

#### Get Category by ID (Public)
```http
GET /api/categories/id/:categoryId
```

#### Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Men's Clothing",
  "description": "Clothing for men",
  "parent": null,
  "image": {
    "url": "https://example.com/category.jpg",
    "alt": "Category image"
  }
}
```

#### Update Category (Admin)
```http
PUT /api/categories/:categoryId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Category Name"
}
```

#### Delete Category (Admin)
```http
DELETE /api/categories/:categoryId
Authorization: Bearer <token>
```

---

### 🛒 Cart Routes (`/api/cart`)

All cart routes require authentication.

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "user": "user_id",
    "items": [
      {
        "_id": "item_id",
        "product": { product details },
        "quantity": 2,
        "size": "M",
        "color": "Blue",
        "price": 29.99
      }
    ],
    "totalItems": 2,
    "subtotal": 59.98
  }
}
```

#### Add Item to Cart
```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 1,
  "size": "M",
  "color": "Blue"
}
```

#### Update Item Quantity
```http
PUT /api/cart/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/items/:itemId
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <token>
```

---

### 📋 Order Routes (`/api/orders`)

All order routes require authentication.

#### Get All User Orders
```http
GET /api/orders?page=1&limit=10&status=pending&sort=-createdAt
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": [ orders ],
  "pagination": { ... }
}
```

#### Get Order by ID
```http
GET /api/orders/:orderId
Authorization: Bearer <token>
```

#### Create New Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "size": "M",
      "color": "Blue"
    }
  ],
  "shippingAddress": {
    "label": "Home",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "cod",
  "pricing": {
    "subtotal": 59.98,
    "tax": 5.00,
    "shippingFee": 10.00,
    "discount": 0,
    "total": 74.98
  },
  "coupon": {
    "code": "SAVE10",
    "discount": 10
  }
}

Response: {
  "success": true,
  "message": "Order created successfully",
  "data": { order details with orderNumber }
}
```

#### Cancel Order
```http
POST /api/orders/:orderId/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

#### Update Order Status (Admin)
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Order dispatched via FedEx"
}
```

#### Get All Orders (Admin)
```http
GET /api/orders/admin/all?page=1&limit=20&status=pending&search=ORD
Authorization: Bearer <token>
```

---

## 🔒 User Roles

- **customer**: Regular users (default)
- **vendor**: Can create and manage their own products
- **admin**: Full access to all resources

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": { ... } // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error for debugging",
  "errors": [ // For validation errors
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# Connect string
MONGODB_URI=mongodb://localhost:27017/green-basket
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/green-basket?retryWrites=true&w=majority
```

---

## 🧪 Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get products:**
```bash
curl http://localhost:5000/api/products
```

### Using Postman/Thunder Client

1. Import the base URL: `http://localhost:5000/api`
2. Set up authentication:
   - Get token from login/verify-otp
   - Add to headers: `Authorization: Bearer <token>`
3. Test all endpoints listed above

---

## 🚀 Deployment

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=very_strong_secret_key_here
CLIENT_URL=https://your-frontend-domain.com
```

### Deploy to Services

**Heroku:**
```bash
heroku create green-basket-api
git push heroku main
heroku config:set MONGODB_URI=your_uri
```

**Railway/Render:**
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy

**VPS (Ubuntu):**
```bash
# Install Node.js and MongoDB
# Clone repository
# Install dependencies
npm install --production
# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name green-basket-api
pm2 startup
pm2 save
```

---

## 📚 Additional Features to Implement

- [ ] Email service for OTP delivery
- [ ] Image upload with Cloudinary
- [ ] Payment gateway integration (Stripe)
- [ ] Order tracking
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Coupon management
- [ ] Admin analytics dashboard
- [ ] Real-time notifications (Socket.io)

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Contact: Arka Services

---

## 📄 License

ISC License - Arka Services

---

**Last Updated:** December 30, 2024
**Version:** 1.0.0
