# Vendor Payment Tracking System

A comprehensive backend API for managing vendor payments, purchase orders, and financial analytics for MSMEs (Micro, Small, and Medium Enterprises).

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
- `POST /auth/login` - User login

### Vendors
- `GET /vendors` - List vendors
- `POST /vendors` - Create vendor
- `GET /vendors/:id` - Get vendor details
- `PUT /vendors/:id` - Update vendor

### Purchase Orders
- `GET /purchase-orders` - List purchase orders
- `POST /purchase-orders` - Create purchase order
- `GET /purchase-orders/:id` - Get purchase order details
- `PUT /purchase-orders/:id/status` - Update PO status

### Payments
- `GET /payments` - List payments
- `POST /payments` - Record payment
- `GET /payments/:id` - Get payment details

### Analytics
- `GET /analytics/dashboard` - Dashboard summary
- `GET /analytics/vendor-outstanding` - Vendor outstanding amounts
- `GET /analytics/payment-aging` - Payment aging report
- `GET /analytics/payment-trends` - Payment trends over time

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
- GitHub repository

### Steps

1. **Connect to Railway**:
   - Go to [Railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Select this repository

2. **Add MySQL Database**:
   - In Railway project, add MySQL service
   - Link it to your app service

3. **Set Environment Variables**:
   - In app service Variables tab:
     - `JWT_SECRET`: Secure random string
     - `NODE_ENV`: `production`

4. **Deploy**:
   - Railway will automatically build and deploy
   - API will be available at the provided domain

### Railway Configuration Files
- `railway.toml`: Build and deploy configuration
- `railpack-plan.json`: Alternative build configuration

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