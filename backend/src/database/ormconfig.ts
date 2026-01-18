import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Vendor } from '../modules/vendors/entities/vendor.entity';
import { PurchaseOrder } from '../modules/purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../modules/purchase-orders/entities/purchase-order-item.entity';
import { Payment } from '../modules/payments/entities/payment.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'vendor_payment_system',
  entities: [Vendor, PurchaseOrder, PurchaseOrderItem, Payment],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
