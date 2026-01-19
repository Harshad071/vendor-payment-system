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
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see .env.example)
4. Run database migrations:
   ```bash
   npm run migration:run
   ```
5. Start the application:
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

**Response:** Returns vendor object with generated `id` (UUID).

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

**Response:** Returns PO object with generated `id`, `poNumber`, and calculated `totalAmount`.

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

## Deployment

This application is configured for deployment on Railway with automatic builds from the main branch.

## Environment Variables

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `PORT` - Application port (default: 3000)