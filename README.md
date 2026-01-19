# Vendor Payment System

A comprehensive backend API for managing vendor payments, purchase orders, and analytics.

## Features

- Vendor management
- Purchase order tracking
- Payment processing
- Analytics and reporting
- JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL database

### Installation

1. Clone the repository
2. Create MySQL database:
   ```sql
   CREATE DATABASE vendor_payment_system;
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables (see .env.example)
5. Run database migrations:
   ```bash
   npm run migration:run
   ```
6. Start the application:
   ```bash
   npm run start:dev
   ```

## API Documentation

Access the Swagger documentation at: `http://localhost:8080/api/docs`

## Authentication

### Login

To access protected endpoints, you must first authenticate and obtain a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "ADMIN"
  },
  "expiresIn": "1h"
}
```

**Note:** JWT tokens are valid for 1 hour. After expiry, you'll need to login again.

### Using the Token

Include the JWT token in the Authorization header for all protected requests:

```
Authorization: Bearer <your_jwt_token_here>
```

**Example with curl:**
```bash
curl -X GET "http://localhost:8080/api/vendors" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Protected Endpoints

All endpoints under `/api/` except `/api/auth/login` require authentication.

## API Usage Guide

### Step 1: Login

First, authenticate to get a JWT token:

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Copy the `access_token` from the response.

### Step 2: Create a Vendor

Create a vendor to associate with purchase orders:

```bash
curl -X POST "http://localhost:8080/api/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "ABC Supplies Ltd",
    "contactPerson": "John Doe",
    "email": "john@abc.com",
    "phone": "+91-9876543210",
    "paymentTerms": 30,
    "status": "Active"
  }'
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ABC Supplies Ltd",
  "contactPerson": "John Doe",
  "email": "john@abc.com",
  "phone": "+91-9876543210",
  "paymentTerms": 30,
  "status": "Active",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Step 3: Create a Purchase Order

Use the vendor ID from step 2:

```bash
curl -X POST "http://localhost:8080/api/purchase-orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "vendorId": "vendor-uuid-from-step-2",
    "poDate": "2024-01-15T00:00:00Z",
    "items": [
      {
        "description": "Office Chairs",
        "quantity": 10,
        "unitPrice": 5000
      },
      {
        "description": "Office Tables",
        "quantity": 5,
        "unitPrice": 8000
      }
    ],
    "notes": "Urgent delivery required"
  }'
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "poNumber": "PO-20240115-001",
  "vendorId": "550e8400-e29b-41d4-a716-446655440000",
  "poDate": "2024-01-15T00:00:00Z",
  "totalAmount": 90000,
  "dueDate": "2024-02-14T00:00:00Z",
  "status": "Draft",
  "notes": "Urgent delivery required",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "description": "Office Chairs",
      "quantity": 10,
      "unitPrice": 5000
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "description": "Office Tables",
      "quantity": 5,
      "unitPrice": 8000
    }
  ]
}
```

### Step 4: Record a Payment

Use the PO ID from step 3:

```bash
curl -X POST "http://localhost:8080/api/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "purchaseOrderId": "po-uuid-from-step-3",
    "paymentDate": "2024-01-20T00:00:00Z",
    "amountPaid": 50000,
    "paymentMethod": "NEFT",
    "notes": "Partial payment"
  }'
```

### Step 5: View Analytics

Get vendor outstanding amounts:

```bash
curl -X GET "http://localhost:8080/api/analytics/vendor-outstanding" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Get payment aging report:

```bash
curl -X GET "http://localhost:8080/api/analytics/payment-aging" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Data Relationships

- **Vendor** has many **Purchase Orders**
- **Purchase Order** has many **Payments**
- **Purchase Order** has many **Purchase Order Items**
- **Payment** belongs to **Purchase Order**

## Sample Data

### Valid Payment Terms
- 7, 15, 30, 45, 60 (days)

### Valid Vendor Status
- "Active", "Inactive"

### Valid PO Status
- "Draft", "Approved", "Partially Paid", "Fully Paid"

### Valid Payment Methods
- "NEFT", "RTGS", "Cheque", "Cash", "UPI"

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found
- 500: Internal Server Error

## API Endpoints

### Vendors
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor

### Purchase Orders
- `GET /api/purchase-orders` - List POs
- `POST /api/purchase-orders` - Create PO
- `GET /api/purchase-orders/:id` - Get PO details
- `PATCH /api/purchase-orders/:id/status` - Update PO status

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `GET /api/payments/:id` - Get payment details
- `DELETE /api/payments/:id` - Void payment

### Analytics
- `GET /api/analytics/vendor-outstanding` - Vendor outstanding amounts
- `GET /api/analytics/payment-aging` - Payment aging report
- `GET /api/analytics/payment-trends` - Payment trends
- `GET /api/analytics/dashboard` - Dashboard summary

## Testing

### Using Swagger UI

1. Start the application: `npm run start:dev`
2. Open `http://localhost:8080/api/docs`
3. Click "Try it out" on any endpoint
4. For protected endpoints, first login via `/api/auth/login` and use the returned token

### Using Postman

Import the Postman collection from `backend/postman-collection.json` and set the base URL to your environment.

### Using curl

See the examples in the API Usage Guide above.

**Security Note:** JWT tokens should be kept secret and never exposed in client-side code.

## Deployment

This application is configured for deployment on Railway with automatic builds from the main branch.

## Environment Variables

- `DATABASE_URL` - Full database connection string (alternative to individual DB vars)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `PORT` - Application port (default: 8080)