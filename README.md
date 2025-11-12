# 🛒 vibeCommerce Backend API

A robust, feature-rich e-commerce backend API built with Node.js, Express, and MongoDB. This API provides complete product catalog management, shopping cart functionality, and checkout capabilities with advanced filtering, searching, and pagination.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### Product Management
- **Advanced Filtering**: Filter products by category, price range (gte, lte, gt, lt)
- **Text Search**: Search across product name, description, category, and brand
- **Sorting**: Sort by any field (price, name, date) in ascending/descending order
- **Pagination**: Efficient pagination with configurable page size
- **Field Selection**: Choose specific fields to return in responses

### Shopping Cart
- **Guest Cart Support**: Full cart functionality without authentication
- **CRUD Operations**: Add, update, view, and remove cart items
- **Real-time Calculations**: Automatic subtotal and total calculations
- **Product References**: Populated product details in cart responses

### Checkout
- **Simple Checkout Flow**: Complete purchase with customer details
- **Receipt Generation**: Automatic receipt with unique ID and timestamp
- **Cart Clearing**: Automatic cart cleanup after successful checkout

### Developer Experience
- **Comprehensive Testing**: 100+ unit tests with Jest
- **Error Handling**: Robust error handling with informative messages
- **Request Logging**: Performance monitoring for all routes
- **Security**: Helmet, HPP, CORS, and rate limiting
- **Compression**: Response compression for optimal performance

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest + MongoDB Memory Server
- **Security**: Helmet, HPP, CORS
- **Performance**: Compression middleware
- **Dev Tools**: Nodemon, dotenv

## 📁 Project Structure

```
server/
├── Controller/           # Route handlers and business logic
│   ├── cartController.js
│   └── productController.js
├── Model/               # Mongoose schemas
│   ├── cartModel.js
│   └── productModel.js
├── Routes/              # API route definitions
│   ├── cartRoutes.js
│   └── productRoutes.js
├── Utils/               # Utility classes
│   └── ApiFeature.js    # Advanced query builder
├── __tests__/           # Test suites
│   ├── setup/
│   │   ├── jest.setup.js
│   │   └── testDb.js
│   └── unit/
│       ├── ApiFeature.test.js
│       ├── cartController.test.js
│       └── productController.test.js
├── app.js               # Express app configuration
├── server.js            # Server entry point
├── jest.config.js       # Jest configuration
└── package.json         # Dependencies and scripts
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd server
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express, Mongoose, CORS, Helmet
- Testing tools (Jest, Supertest)
- Development tools (Nodemon)

### 3. Create Configuration File

Create a `config.env` file in the server root:

```bash
touch config.env
```

## ⚙️ Environment Configuration

Add the following to your `config.env` file:

```env
# Database Configuration
DATABASE_URI= mongodb+srv://sankalppatel38_db_user:tMdFf7281OK5CzKI@nexoracluster0.seg6hyt.mongodb.net/?appName=NexoraCluster0

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: MongoDB Atlas (if using cloud database)
# DATABASE_URI= mongodb+srv://sankalppatel38_db_user:tMdFf7281OK5CzKI@nexoracluster0.seg6hyt.mongodb.net/?appName=NexoraCluster0
```

### Configuration Options Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URI` | MongoDB connection string | `mongodb+srv://sankalppatel38_db_user:tMdFf7281OK5CzKI@nexoracluster0.seg6hyt.mongodb.net/?appName=NexoraCluster0` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## 🏃 Running the Application

### Development Mode (with auto-restart)

```bash
npm start
```

This uses `nodemon` to automatically restart the server when files change.

### Production Mode

```bash
npm run dev
```

### Expected Output

```
✅ Database Connected Successfully
🛒 Products seeded successfully!
🚀 Server running on http://127.0.0.1:5000
```

### Testing the Server

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

## 📡 API Endpoints

### Products

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term (searches name, description, category, brand)
- `category` - Filter by category (can be array)
- `price[gte]` - Minimum price
- `price[lte]` - Maximum price
- `price[gt]` - Greater than price
- `price[lt]` - Less than price
- `sort` - Sort field (prefix with `-` for descending)
- `fields` - Comma-separated fields to return

**Examples:**

```bash
# Get all products (paginated)
GET /api/products?page=1&limit=10

# Search products
GET /api/products?search=laptop

# Filter by category
GET /api/products?category=electronics

# Filter by price range
GET /api/products?price[gte]=1000&price[lte]=5000

# Multiple filters + sorting
GET /api/products?category=electronics&sort=-price&limit=5

# Select specific fields
GET /api/products?fields=name,price,category
```

**Response:**
```json
{
  "status": "success",
  "result": 10,
  "totalCount": 45,
  "totalPages": 5,
  "currentPage": 1,
  "message": "List of all products",
  "data": [
    {
      "_id": "...",
      "name": "Laptop Pro",
      "price": 150000,
      "category": "electronics",
      "image": "https://...",
      "createdAt": "2025-11-12T..."
    }
  ]
}
```

### Shopping Cart

#### Get Cart
```http
GET /api/cart
```

**Response:**
```json
{
  "status": "success",
  "message": "Cart fetched successfully",
  "result": 2,
  "data": {
    "items": [
      {
        "_id": "...",
        "productId": "...",
        "name": "Laptop Pro",
        "image": "https://...",
        "price": 150000,
        "qty": 2,
        "subtotal": 300000
      }
    ],
    "total": 300000
  }
}
```

#### Delete Cart Item
```http
DELETE /api/cart/:id
```

#### Checkout
```http
POST /api/cart/checkout
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Checkout completed successfully",
  "data": {
    "receiptId": "rcpt_abc123xyz",
    "name": "John Doe",
    "email": "john@example.com",
    "total": 300000,
    "totalFormatted": "$3000.00",
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

### Health Check
```http
GET /health
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

The project includes comprehensive test coverage:

- **ApiFeature Tests**: 40+ tests for search, filter, sort, pagination
- **Cart Controller Tests**: 15+ tests for all cart operations
- **Product Controller Tests**: 15+ tests for product retrieval

### Test Features

- ✅ In-memory MongoDB (no external DB needed)
- ✅ Automatic setup and teardown
- ✅ Isolated test environments
- ✅ Mock request/response objects
- ✅ Detailed error reporting

### Test Output Example

```
PASS  __tests__/unit/productController.test.js
  Product Controller Tests
    getAllProduct
      ✓ should return all products with default pagination (45ms)
      ✓ should handle pagination correctly (32ms)
      ✓ should filter by category (28ms)
      ✓ should search by product name (35ms)

Test Suites: 3 passed, 3 total
Tests:       71 passed, 71 total
Time:        8.245 s
```

### Cart Management

The cart system uses a **guest-based approach**:

```javascript
const DEMO_USER = "guest";
```

**Key Features:**
- No authentication required
- All carts tied to "guest" user
- Product details embedded for quick access
- Automatic total calculation
- Upsert pattern for add/update operations

### Error Handling Pattern

All controllers follow consistent error handling:

```javascript
try {
  // Operation logic
  return res.status(200).json({
    status: "success",
    message: "...",
    data: result
  });
} catch (error) {
  return res.status(500).json({
    status: "error",
    message: "...",
    error: error.message
  });
}
```

### Response Format

All API responses follow a consistent structure:

```javascript
{
  "status": "success" | "error" | "fail",
  "message": "Human-readable message",
  "result": 10,              // Optional: count of items
  "totalCount": 45,          // Optional: total in database
  "totalPages": 5,           // Optional: for pagination
  "currentPage": 1,          // Optional: current page
  "data": { ... } | [ ... ]  // Response payload
}
```

## 📸 Screenshots

### API Testing with Postman/Thunder Client

#### 1. Get All Products
![Get All Products](./screenshots/get-products.png)
*Shows paginated product list with filters*

#### 4. Get Shopping Cart
![Get Cart](./screenshots/get-cart.png)
*View cart with calculated totals*

#### 5. Add to Cart
![Add to Cart](./screenshots/add-cart.png)
*Adding/updating cart items*

#### 6. Checkout
![Checkout](./screenshots/checkout.png)
*Completing purchase with receipt*

#### 7. Test Results
![Test Coverage](./screenshots/test-results.png)
*Jest test execution and coverage*

#### 8. Database View
![MongoDB Data](./screenshots/mongodb-data.png)
*Products and cart collections in MongoDB*

> **Note**: Add actual screenshots to a `screenshots/` directory in your project root.

## 🔒 Security Features

- **Helmet**: Sets security HTTP headers
- **HPP**: Prevents HTTP Parameter Pollution
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Query parameter sanitization
- **Rate Limiting**: Request size limits (10kb)
- **Error Sanitization**: Sensitive info removed from errors

## 🚀 Performance Optimizations

- **Compression**: Gzip compression for responses
- **Database Indexing**: Optimized queries with indexes
- **Lean Queries**: Mongoose lean() for faster reads
- **Pagination**: Prevents large dataset transfers
- **Field Selection**: Reduces payload size
- **Request Logging**: Performance monitoring

## 📝 API Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Sankalp**

---

## 🎯 Future Enhancements

- [ ] User authentication & authorization
- [ ] Order management system
- [ ] Payment gateway integration
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Real-time inventory tracking
- [ ] Multi-currency support
- [ ] GraphQL API option

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

---

**Happy Coding! 🎉**
