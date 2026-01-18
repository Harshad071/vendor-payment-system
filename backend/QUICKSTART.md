# Quick Start Guide

Get the MSME Vendor Payment Tracking System running in 5 minutes.

## Prerequisites
- Node.js 18+ installed
- MySQL 5.7+ running locally or remote

## 1. Setup (2 minutes)

```bash
# Clone/extract and navigate
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_NAME=vendor_payment_system
```

## 2. Database (1 minute)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE vendor_payment_system;"

# Run migrations
npm run migration:run

# Seed sample data
npm run seed
```

## 3. Start Server (1 minute)

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## 4. Login & Test (1 minute)

### Option A: Using Swagger UI
1. Open http://localhost:3000/api/docs
2. Click "Authorize" button
3. Login with:
   - Username: `admin`
   - Password: `admin123`
4. Try endpoints from the interactive Swagger interface

### Option B: Using cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy the "accessToken" from response

# 2. Test with token
curl -X GET http://localhost:3000/analytics/vendor-outstanding \
  -H "Authorization: Bearer <paste_token_here>"
```

### Option C: Using Postman
1. Import `postman-collection.json`
2. Set `base_url` = `http://localhost:3000`
3. Set `access_token` from login response
4. Run requests

---

## Key Endpoints to Test

### 1. Vendor Outstanding Balance
```
GET http://localhost:3000/analytics/vendor-outstanding
```
Shows how much each vendor owes you.

### 2. Payment Aging Report
```
GET http://localhost:3000/analytics/payment-aging
```
Shows overdue payments by age (0-30, 31-60, 61-90, 90+ days).

### 3. List Vendors
```
GET http://localhost:3000/vendors?page=1&limit=20
```
Browse all vendors with pagination.

### 4. List Purchase Orders
```
GET http://localhost:3000/purchase-orders?page=1&limit=20
```
View all POs with statuses.

### 5. Record Payment
```
POST http://localhost:3000/payments
{
  "purchaseOrderId": "<po_id>",
  "paymentDate": "2024-01-20T00:00:00Z",
  "amountPaid": 5000,
  "paymentMethod": "NEFT"
}
```
Auto-updates PO status based on payment amount.

---

## Sample Workflow

### Create a Complete Purchase-to-Pay Flow

1. **List existing vendors**
   ```bash
   GET /vendors
   ```

2. **Get vendor ID, then create PO**
   ```bash
   POST /purchase-orders
   {
     "vendorId": "123...",
     "poDate": "2024-01-15",
     "items": [{"description": "Item", "quantity": 10, "unitPrice": 100}]
   }
   ```

3. **Record partial payment**
   ```bash
   POST /payments
   {
     "purchaseOrderId": "456...",
     "paymentDate": "2024-01-20",
     "amountPaid": 500,
     "paymentMethod": "NEFT"
   }
   ```
   → PO status changes to "Partially Paid"

4. **Record final payment**
   ```bash
   POST /payments
   {
     "purchaseOrderId": "456...",
     "paymentDate": "2024-01-25",
     "amountPaid": 500,
     "paymentMethod": "NEFT"
   }
   ```
   → PO status changes to "Fully Paid"

5. **Check analytics**
   ```bash
   GET /analytics/vendor-outstanding
   GET /analytics/payment-aging
   ```

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
→ Ensure MySQL is running and credentials in `.env` are correct

### Migrations Failed
```
npm run migration:revert
npm run migration:run
```

### Port 3000 Already in Use
```bash
PORT=3001 npm run dev
```

### JWT Secret Warning
Change JWT_SECRET in `.env`:
```
JWT_SECRET=your_super_secure_random_string_here
```

---

## Demo Data Included

After seeding, you'll have:
- ✓ 5 vendors (ABC Electronics, Premier Industrial, etc.)
- ✓ 15 purchase orders
- ✓ 10 payments
- ✓ Demo user: admin / admin123

---

## Next Steps

1. **Deploy to Cloud**
   - Railway: https://railway.app
   - Render: https://render.com
   - AWS/Azure/GCP: See README.md

2. **Integrate with Frontend**
   - Use API base URL: `http://localhost:3000`
   - Include `Authorization: Bearer <token>` header
   - Swagger docs at `/api/docs`

3. **Customize**
   - Add more vendors
   - Create custom purchase orders
   - Implement real user authentication
   - Add custom analytics

---

## Support

- API Docs: http://localhost:3000/api/docs
- Full README: See README.md
- Postman Collection: postman-collection.json

Happy tracking! 🎉
