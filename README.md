# Vendor Payment Tracking System

A comprehensive backend API for managing vendor payments, purchase orders, and financial analytics for MSMEs (Micro, Small, and Medium Enterprises).

## 🚀 Live Demo

<<<<<<< HEAD

=======
>>>>>>> efb58096bd0259b410d3fa5948800174594c776a
**API Base URL**: https://lucid-art.up.railway.app/api/docs

*Note: This is a backend API. For a complete frontend experience, you'll need to build or connect a frontend application.*

## Features

- **Vendor Management**: Create and manage vendor information with payment terms
- **Purchase Order Tracking**: Full lifecycle management of purchase orders
- **Payment Recording**: Track payments against purchase orders
- **Analytics Dashboard**: Payment aging, vendor outstanding, and payment trends
- **RESTful API**: Complete API with Swagger documentation
- **Authentication**: JWT-based authentication system
- **Database**: MySQL with TypeORM

## Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Railway

## API Endpoints

### Authentication
- `POST /auth/login` - User authentication (returns JWT token)

### Vendors
- `GET /vendors` - List all vendors with pagination
- `POST /vendors` - Create new vendor
- `GET /vendors/:id` - Get vendor details with payment summary
- `PUT /vendors/:id` - Update vendor information

### Purchase Orders
- `GET /purchase-orders` - List POs with filtering and pagination
- `POST /purchase-orders` - Create new purchase order with items
- `GET /purchase-orders/:id` - Get PO details with items and payments
- `PUT /purchase-orders/:id/status` - Update PO status (Draft → Approved → Paid)

### Payments
- `GET /payments` - List payments with filtering and pagination
- `POST /payments` - Record payment against purchase order
- `GET /payments/:id` - Get payment details
- `DELETE /payments/:id` - Void payment (soft delete)

### Analytics
- `GET /analytics/dashboard` - Overall system statistics
- `GET /analytics/vendor-outstanding` - Outstanding amounts by vendor
- `GET /analytics/payment-aging` - Payment aging analysis (current/30/60/90+ days)
- `GET /analytics/payment-trends` - Payment trends over last 6 months

### API Documentation
- Interactive Swagger UI: `https://lucid-art.up.railway.app/api/docs`
- OpenAPI JSON: `https://lucid-art.up.railway.app/api/docs-json`

### Request/Response Examples

**Create Vendor**:
```json
POST /vendors
{
  "name": "ABC Supplies Ltd",
  "contactPerson": "John Doe",
  "email": "john@abc.com",
  "phone": "+1234567890",
  "paymentTerms": "30"
}
```

**Create Purchase Order**:
```json
POST /purchase-orders
{
  "vendorId": "uuid",
  "poDate": "2024-01-15",
  "items": [
    {
      "description": "Office Chairs",
      "quantity": 10,
      "unitPrice": 150.00
    }
  ],
  "notes": "Urgent delivery required"
}
```

**Record Payment**:
```json
POST /payments
{
  "purchaseOrderId": "uuid",
  "amountPaid": 1500.00,
  "paymentDate": "2024-01-20",
  "paymentMethod": "NEFT",
  "notes": "Payment reference: TXN123"
}
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Harshad071/vendor-payment-system.git
cd vendor-payment-system
```

2. Install dependencies:
```bash
cd backend
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the `backend` directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=vendor_payment_system
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Set up the database:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE vendor_payment_system;"

# Run migrations
pnpm run migration:run
```

5. Start the development server:
```bash
pnpm run dev
```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api/docs`

## Deployment on Railway

### Prerequisites
- Railway account
- GitHub repository connected

### Steps

1. **Connect to Railway**:
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" > "Deploy from GitHub repo"
   - Select `Harshad071/vendor-payment-system` repository

2. **Add MySQL Database**:
   - In your Railway project dashboard, click "+" > "Database" > "MySQL"
   - Name it (e.g., "mysql-db")
   - Wait for it to deploy

3. **Link Database to App**:
   - Go to your app service settings
   - Find "Linked Services" section
   - Click "Link Service" and select your MySQL database
   - This automatically provides `DATABASE_URL` to your app

4. **Set Environment Variables**:
   - In your app service "Variables" tab, add:
     - `JWT_SECRET`: Generate a secure random string (32+ characters)
     - `NODE_ENV`: `production`

5. **Deploy**:
   - Railway will automatically build and deploy on code changes
   - Monitor build logs for any issues
   - API will be available at the generated Railway domain

### Troubleshooting Railway Deployment

**Database Connection Issues**:
- Ensure MySQL service is fully deployed before linking
- Check that `DATABASE_URL` appears in app Variables after linking
- If private networking fails, enable public access on MySQL and use `MYSQL_PUBLIC_URL`

**Build Failures**:
- Check Railway build logs for TypeScript errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Runtime Errors**:
- Check deploy logs for environment variable issues
- Ensure `JWT_SECRET` is set
- Verify database tables are created (check MySQL logs)

### Railway Configuration Files
- `railway.toml`: Build and deploy configuration
- `railpack-plan.json`: Alternative build configuration
- `.railpackignore`: Files to exclude from build

## Database Schema

### Tables
- `vendors`: Vendor information
- `purchase_orders`: Purchase order details
- `purchase_order_items`: PO line items
- `payments`: Payment records

### Key Relationships
- Purchase Orders → Vendors (Many-to-One)
- Purchase Order Items → Purchase Orders (Many-to-One)
- Payments → Purchase Orders (Many-to-One)

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts          # Main application module
│   ├── main.ts                # Application entry point
│   ├── auth/                  # Authentication module
│   ├── modules/
│   │   ├── vendors/           # Vendor management
│   │   ├── purchase-orders/   # PO management
│   │   ├── payments/          # Payment tracking
│   │   └── analytics/         # Analytics and reporting
│   └── database/              # Database configuration
├── test/                      # Test files
└── dist/                      # Compiled output
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `password` |
| `DB_NAME` | Database name | `vendor_payment_system` |
| `JWT_SECRET` | JWT signing secret | `your_jwt_secret_key` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | Full DB connection URL (Railway) | - |

## Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server

# Database
pnpm run migration:generate  # Generate migration
pnpm run migration:run       # Run migrations
pnpm run migration:revert    # Revert migration
pnpm run seed                # Run database seeds

# Testing
pnpm run test         # Run tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation at `/api/docs`

- Review the Railway deployment logs
