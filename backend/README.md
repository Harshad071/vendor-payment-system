# MSME Vendor Payment Tracking System API

A production-ready NestJS backend API for managing vendor relationships, purchase orders, and payment tracking for small and medium-sized enterprises (MSMEs).

**Author:** Harshad Jadhav  
**Tech Stack:** NestJS + TypeScript + MySQL + TypeORM  
**License:** MIT

---

## Features

### Core Features ✓
- **Vendor Management** - Create, read, update vendors with payment terms
- **Purchase Order Management** - Auto-generate PO numbers, manage line items, track status
- **Payment Recording** - Record payments with auto-status updates and transaction support
- **Analytics** - Vendor outstanding balance, payment aging, payment trends, dashboard summary

### Advanced Features ✓
- **JWT Authentication** - Secure token-based auth
- **Soft Deletes** - Maintain data integrity with soft delete support
- **Audit Trail** - Track user actions (createdBy, updatedBy)
- **Pagination & Filtering** - Advanced filtering on all list endpoints
- **Transaction Support** - Database transactions for payment operations
- **Swagger/OpenAPI** - Auto-generated API documentation
- **Input Validation** - Class-validator DTOs
- **Error Handling** - Comprehensive error responses

---

## Prerequisites

- **Node.js** 18+ / 20+
- **MySQL** 5.7+ or 8.0+
- **npm** or **yarn**

---

## Installation & Setup

### 1. Clone & Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file in the root:
```env
# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=vendor_payment_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=24h

# Server
PORT=3000
NODE_ENV=development
```

For **Railway/Render/Cloud Deployment**, use:
```env
DATABASE_URL=mysql://user:password@host:port/dbname
```

### 3. Database Setup

#### Option A: TypeORM Migrations
```bash
# Run migrations
npm run migration:run

# Generate new migration (if schema changes)
npm run migration:generate
```

#### Option B: Manual SQL
```sql
CREATE DATABASE vendor_payment_system;
USE vendor_payment_system;

-- Run the migration SQL from src/database/migrations/InitialSchema.ts
```

### 4. Seed Sample Data
```bash
npm run seed
```

This creates:
- 5 vendors
- 15 purchase orders
- 10 payments
- Demo user: `admin` / `admin123`

---

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
npm run test:watch
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Swagger Documentation
```
http://localhost:3000/api/docs
```

### Authentication

**Login Endpoint:**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@vendor-system.local"
  },
  "expiresIn": "24h"
}
```

Use the token in all subsequent requests:
```http
Authorization: Bearer <accessToken>
```

---

## API Endpoints Reference

### Vendors
- **POST** `/vendors` - Create vendor
- **GET** `/vendors` - List vendors (with pagination)
- **GET** `/vendors/:id` - Get vendor details + payment summary
- **PUT** `/vendors/:id` - Update vendor

### Purchase Orders
- **POST** `/purchase-orders` - Create PO
- **GET** `/purchase-orders` - List POs with filtering
- **GET** `/purchase-orders/:id` - Get PO details
- **PATCH** `/purchase-orders/:id/status` - Update PO status

### Payments
- **POST** `/payments` - Record payment
- **GET** `/payments` - List payments
- **GET** `/payments/:id` - Get payment details
- **DELETE** `/payments/:id` - Void payment (soft delete)

### Analytics
- **GET** `/analytics/vendor-outstanding` - Outstanding by vendor
- **GET** `/analytics/payment-aging` - Payment aging report
- **GET** `/analytics/payment-trends` - Monthly trends (6 months)
- **GET** `/analytics/dashboard` - Dashboard summary

### Health
- **GET** `/health` - API health check

---

## Database Schema

### Vendors Table
```
vendors
├── id (UUID, Primary Key)
├── name (VARCHAR, Unique)
├── contactPerson (VARCHAR)
├── email (VARCHAR, Unique)
├── phone (VARCHAR)
├── paymentTerms (ENUM: 7, 15, 30, 45, 60 days)
├── status (ENUM: Active, Inactive)
├── createdAt (DateTime)
├── updatedAt (DateTime)
├── createdBy (VARCHAR)
└── updatedBy (VARCHAR)
```

### Purchase Orders Table
```
purchase_orders
├── id (UUID, Primary Key)
├── poNumber (VARCHAR, Unique, Auto-generated)
├── vendorId (UUID, Foreign Key → vendors)
├── poDate (DateTime)
├── totalAmount (DECIMAL)
├── dueDate (DateTime, Auto-calculated)
├── status (ENUM: Draft, Approved, Partially Paid, Fully Paid)
├── notes (TEXT)
├── isDeleted (Boolean, Soft Delete)
├── createdAt (DateTime)
├── updatedAt (DateTime)
├── createdBy (VARCHAR)
└── updatedBy (VARCHAR)
```

### Purchase Order Items Table
```
purchase_order_items
├── id (UUID, Primary Key)
├── purchaseOrderId (UUID, Foreign Key → purchase_orders)
├── description (VARCHAR)
├── quantity (DECIMAL)
└── unitPrice (DECIMAL)
```

### Payments Table
```
payments
├── id (UUID, Primary Key)
├── paymentReference (VARCHAR, Unique, Auto-generated)
├── purchaseOrderId (UUID, Foreign Key → purchase_orders)
├── paymentDate (DateTime)
├── amountPaid (DECIMAL)
├── paymentMethod (ENUM: Cash, Cheque, NEFT, RTGS, UPI)
├── notes (TEXT)
├── isDeleted (Boolean, Soft Delete)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── createdBy (VARCHAR)
```

---

## Key Design Decisions

### 1. **PO Status Auto-Update**
When a payment is recorded, the system automatically recalculates the PO status:
- Payment amount exceeds outstanding → Status: Fully Paid
- Payment made but outstanding remains → Status: Partially Paid
- No payments → Status: Approved/Draft

### 2. **Transaction Support**
Payment operations use database transactions to ensure data consistency:
- Payment creation + PO status update happen atomically
- Void operations rollback on error

### 3. **Soft Deletes**
- Payments and POs use soft deletes (isDeleted flag) to maintain data integrity
- Historical data is preserved for audit trails

### 4. **Auto-Generated Numbers**
- **PO Number:** PO-YYYYMMDD-XXX (e.g., PO-20240115-001)
- **Payment Reference:** PAY-YYYYMMDD-XXX (e.g., PAY-20240115-001)

### 5. **JWT Authentication**
- Simple hardcoded demo user for ease of testing
- Production: Implement user table + password hashing (bcrypt)

### 6. **Pagination**
- Default limit: 20 items, Max: 100 items
- Prevents large dataset transfers

---

## Testing Scenarios

### Scenario 1: Create and Pay Vendor Invoice
```bash
# 1. Create vendor
POST /vendors
{
  "name": "Test Vendor",
  "email": "test@vendor.com",
  "paymentTerms": 30,
  "status": "Active"
}

# 2. Create PO
POST /purchase-orders
{
  "vendorId": "vendor-id",
  "poDate": "2024-01-15",
  "items": [
    { "description": "Item 1", "quantity": 10, "unitPrice": 100 }
  ]
}

# 3. Record partial payment
POST /payments
{
  "purchaseOrderId": "po-id",
  "paymentDate": "2024-01-20",
  "amountPaid": 500,
  "paymentMethod": "NEFT"
}
# PO status changes to "Partially Paid"

# 4. Record final payment
POST /payments
{
  "purchaseOrderId": "po-id",
  "paymentDate": "2024-01-25",
  "amountPaid": 500,
  "paymentMethod": "NEFT"
}
# PO status changes to "Fully Paid"
```

### Scenario 2: Check Outstanding Balances
```bash
GET /analytics/vendor-outstanding
# Returns all vendors with outstanding amounts
```

### Scenario 3: Payment Aging Analysis
```bash
GET /analytics/payment-aging
# Returns overdue POs grouped by age (0-30, 31-60, 61-90, 90+ days)
```

---

## Deployment

### Railway.app
1. Create Railway project
2. Add MySQL database service
3. Connect GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy

### Render.com
1. Create new Web Service from GitHub
2. Add environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add MySQL database service
6. Deploy

### AWS/Azure/GCP
1. Build Docker image (Dockerfile needed)
2. Deploy to container service
3. Connect to managed MySQL database
4. Configure environment variables

---

## Time Breakdown

- **Database Design:** 2 hours
  - Schema planning, normalization, relationships
- **API Development:** 6 hours
  - Modules, controllers, services, DTOs
  - Authentication setup
- **Analytics & Features:** 2 hours
  - Analytics endpoints, advanced filtering
  - Soft deletes, audit trails
- **Testing & Documentation:** 2 hours
  - Seed data, API testing
  - README and Swagger docs
- **Total:** 12 hours

---

## API Examples with cURL

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Create Vendor
```bash
curl -X POST http://localhost:3000/vendors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Vendor",
    "email": "vendor@example.com",
    "paymentTerms": 30,
    "status": "Active"
  }'
```

### Get Vendor Outstanding
```bash
curl -X GET http://localhost:3000/analytics/vendor-outstanding \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database exists

### Migration Errors
```bash
npm run migration:revert  # Rollback
npm run migration:run     # Re-run
```

### JWT Token Expired
- Get new token from `/auth/login`
- Token valid for 24 hours

### Port Already in Use
```bash
PORT=3001 npm run dev
```

---

## Support

For issues or questions, please create an issue in the GitHub repository.

---

## License

MIT License - See LICENSE file for details.
