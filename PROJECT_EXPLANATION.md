# Vendor Payment Tracking System - Detailed Project Explanation

This document provides a comprehensive explanation of how the Vendor Payment Tracking System works, including the purpose of each file, their connections, and the overall architecture.

## 🏗️ Project Architecture

The system is built using **NestJS** (Node.js framework) with **TypeORM** for database management and **MySQL** as the database. It follows a modular, layered architecture:

```
┌─────────────────┐
│   Controllers   │ ← HTTP request/response handling
├─────────────────┤
│   Services      │ ← Business logic
├─────────────────┤
│   Entities      │ ← Database models
├─────────────────┤
│   DTOs          │ ← Data transfer objects
├─────────────────┤
│   Database      │ ← ORM configuration
└─────────────────┘
```

## 📁 Root Level Files

### Configuration Files
- **`package.json`**: Defines project metadata, dependencies, and scripts
  - Dependencies: NestJS core, TypeORM, MySQL driver, validation, JWT
  - Scripts: build, start, dev, test, database migrations

- **`tsconfig.json`**: TypeScript compiler configuration
  - Target: ES2020, strict mode enabled
  - Decorators enabled for NestJS

- **`railway.toml`**: Railway deployment configuration
  - Specifies build root directory (backend)
  - Defines start command with database migrations

- **`railpack-plan.json`**: Alternative Railway build configuration
  - Similar to railway.toml but with different structure

- **`.railpackignore`**: Files to exclude from Railway builds
  - Excludes frontend files (package.json, pnpm-lock.yaml)

### Documentation
- **`README.md`**: Project documentation with setup and deployment instructions
- **`PROJECT_EXPLANATION.md`**: This detailed technical explanation

## 🔧 Backend Directory Structure

### `backend/src/` - Main Source Code

#### Core Application Files

**`main.ts`** - Application Entry Point
- Bootstraps the NestJS application
- Configures global validation pipes
- Sets up CORS
- Enables Swagger documentation
- Starts the HTTP server on port 3000 (or PORT env var)
- **Connections**: Imports AppModule, sets up global middleware

**`app.module.ts`** - Root Application Module
- Imports all feature modules
- Configures TypeORM database connection
- Sets up global ConfigModule
- **Connections**:
  - Imports: AuthModule, VendorsModule, PurchaseOrdersModule, PaymentsModule, AnalyticsModule
  - Database: Connects to MySQL using environment variables or DATABASE_URL

**`app.controller.ts`** & **`app.service.ts`**
- Basic health check endpoint
- Returns "Hello World" message

#### Authentication Module (`auth/`)

**`auth.module.ts`**
- Configures JWT authentication
- Imports PassportModule and JwtModule
- **Connections**: Uses JwtStrategy for token validation

**`auth.service.ts`**
- Handles user authentication logic
- Validates credentials (currently placeholder)
- Generates JWT tokens
- **Connections**: Uses JwtService for token creation

**`auth.controller.ts`**
- `POST /auth/login` endpoint
- Accepts login credentials
- Returns JWT token on success
- **Connections**: Uses AuthService for authentication

**`jwt.strategy.ts`**
- Passport JWT strategy implementation
- Extracts JWT from Authorization header
- Validates token signature
- **Connections**: Uses JWT_SECRET environment variable

**`jwt-auth.guard.ts`**
- Route guard for protected endpoints
- Requires valid JWT token
- **Connections**: Applied to controllers requiring authentication

#### Database Configuration (`database/`)

**`ormconfig.ts`**
- TypeORM DataSource configuration
- Supports both individual DB vars and DATABASE_URL
- Configures entity paths and migrations
- **Connections**:
  - Entities: Vendor, PurchaseOrder, PurchaseOrderItem, Payment
  - Migrations: SQL files for schema changes

**`migrations/1704000000000-InitialSchema.ts`**
- Database schema creation migration
- Defines all tables: vendors, purchase_orders, purchase_order_items, payments
- Sets up foreign key relationships
- **Connections**: Creates tables with proper constraints and indexes

**`seeds/seed.ts`**
- Database seeding script
- Populates initial data (currently empty)
- **Connections**: Uses DataSource to insert sample data

#### Vendors Module (`modules/vendors/`)

**`vendors.module.ts`**
- Module definition for vendor management
- Imports TypeOrmModule.forFeature([Vendor])
- **Connections**: Provides VendorsService and VendorsController

**`vendors.service.ts`**
- Business logic for vendor operations
- CRUD operations: create, findAll, findById, update
- Includes payment summary calculations
- **Connections**:
  - Uses Vendor repository for database operations
  - Calculates outstanding amounts from related POs and payments

**`vendors.controller.ts`**
- REST API endpoints for vendors
- Routes: GET /vendors, POST /vendors, GET /vendors/:id, PUT /vendors/:id
- **Connections**: Uses VendorsService, protected by JwtAuthGuard

**`entities/vendor.entity.ts`**
- Database model for vendors
- Fields: id, name, contactPerson, email, phone, paymentTerms, status
- **Connections**: Related to PurchaseOrder entities (One-to-Many)

**DTOs** (`dtos/`)
- `create-vendor.dto.ts`: Validation for vendor creation
- `update-vendor.dto.ts`: Validation for vendor updates

#### Purchase Orders Module (`modules/purchase-orders/`)

**`purchase-orders.module.ts`**
- Module for PO management
- Imports TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem])
- Imports VendorsModule and PaymentsModule
- **Connections**: Provides PurchaseOrdersService and PurchaseOrdersController

**`purchase-orders.service.ts`**
- Complex business logic for purchase orders
- Generates PO numbers automatically
- Handles PO creation with items and status updates
- Calculates outstanding amounts
- **Connections**:
  - Uses PurchaseOrder and PurchaseOrderItem repositories
  - Depends on VendorsService for vendor validation
  - Updates PO status based on payments

**`purchase-orders.controller.ts`**
- REST endpoints for POs
- Routes: GET /purchase-orders, POST /purchase-orders, GET /purchase-orders/:id, PUT /purchase-orders/:id/status
- **Connections**: Uses PurchaseOrdersService, protected by JwtAuthGuard

**Entities**:
- `purchase-order.entity.ts`: Main PO model with vendor relationship
- `purchase-order-item.entity.ts`: PO line items

**DTOs**:
- `create-purchase-order.dto.ts`: PO creation validation
- `update-po-status.dto.ts`: Status update validation

#### Payments Module (`modules/payments/`)

**`payments.module.ts`**
- Module for payment tracking
- Imports TypeOrmModule.forFeature([Payment])
- Imports PurchaseOrdersModule
- **Connections**: Provides PaymentsService and PaymentsController

**`payments.service.ts`**
- Payment recording and management logic
- Generates payment references
- Handles payment transactions with PO status updates
- **Connections**:
  - Uses Payment repository
  - Depends on PurchaseOrdersService for PO validation and status updates
  - Uses DataSource for transactions

**`payments.controller.ts`**
- Payment API endpoints
- Routes: GET /payments, POST /payments, GET /payments/:id, DELETE /payments/:id
- **Connections**: Uses PaymentsService, protected by JwtAuthGuard

**`entities/payment.entity.ts`**
- Payment database model
- Fields: paymentReference, amountPaid, paymentDate, paymentMethod, etc.
- **Connections**: Related to PurchaseOrder (Many-to-One)

**DTOs**:
- `create-payment.dto.ts`: Payment creation validation

#### Analytics Module (`modules/analytics/`)

**`analytics.module.ts`**
- Module for reporting and analytics
- Imports TypeOrmModule.forFeature([PurchaseOrder, Payment, Vendor])
- **Connections**: Provides AnalyticsService and AnalyticsController

**`analytics.service.ts`**
- Complex analytics calculations
- Vendor outstanding analysis
- Payment aging reports
- Payment trend analysis
- **Connections**: Uses all three entity repositories for cross-entity queries

**`analytics.controller.ts`**
- Analytics API endpoints
- Routes: GET /analytics/dashboard, GET /analytics/vendor-outstanding, etc.
- **Connections**: Uses AnalyticsService, protected by JwtAuthGuard

## 🔄 Data Flow and Connections

### Request Flow
1. **HTTP Request** → Controller (validates input with DTOs)
2. **Controller** → Service (business logic)
3. **Service** → Repository (database operations via TypeORM)
4. **Repository** → Database (SQL queries)
5. **Response** flows back through the layers

### Database Relationships
```
Vendor (1) ←→ (Many) PurchaseOrder
PurchaseOrder (1) ←→ (Many) PurchaseOrderItem
PurchaseOrder (1) ←→ (Many) Payment
```

### Module Dependencies
- **PurchaseOrdersModule** depends on **VendorsModule**
- **PaymentsModule** depends on **PurchaseOrdersModule**
- **AnalyticsModule** depends on all entity repositories
- **AppModule** imports all feature modules

## 🛠️ Key Technologies Integration

### NestJS Framework
- **Modules**: Organize code into feature-based modules
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Guards**: Protect routes (JWT authentication)
- **DTOs**: Validate and transform input data
- **Pipes**: Global validation and transformation

### TypeORM Integration
- **Entities**: Define database tables and relationships
- **Repositories**: Provide database access methods
- **Migrations**: Version-controlled schema changes
- **Query Builder**: Complex SQL queries for analytics

### Authentication Flow
1. Client sends login request
2. AuthController validates credentials
3. AuthService generates JWT token
4. Client includes token in subsequent requests
5. JwtAuthGuard validates token on protected routes

### Database Connection
- **Development**: Uses individual DB_* environment variables
- **Production**: Parses DATABASE_URL from Railway
- **Fallback**: Defaults to localhost MySQL

## 🚀 Deployment Process

### Build Phase
1. Railway clones repository
2. Installs dependencies in backend directory
3. Compiles TypeScript to JavaScript
4. Copies ormconfig.ts for migrations

### Runtime Phase
1. Runs database migrations (creates/updates tables)
2. Starts NestJS application
3. Initializes database connections
4. Serves API on assigned port

### Environment Variables
- **DATABASE_URL**: Full MySQL connection string (Railway)
- **DB_HOST/DB_PORT/etc.**: Individual database settings (local dev)
- **JWT_SECRET**: Token signing key
- **NODE_ENV**: Environment indicator

## 🔍 Key Design Patterns

### Repository Pattern
- Abstract database operations
- Consistent data access interface
- Easy testing and mocking

### Dependency Injection
- Loose coupling between components
- Easy testing and maintenance
- NestJS handles injection automatically

### DTO Pattern
- Validate input data
- Transform data between layers
- Type safety with TypeScript

### Transaction Management
- Complex operations wrapped in database transactions
- Ensures data consistency
- Rollback on errors

### Module Organization
- Feature-based modules
- Clear separation of concerns
- Scalable architecture

This architecture provides a robust, maintainable, and scalable foundation for the Vendor Payment Tracking System.