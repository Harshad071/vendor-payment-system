import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Vendor } from '../modules/vendors/entities/vendor.entity';
import { PurchaseOrder } from '../modules/purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../modules/purchase-orders/entities/purchase-order-item.entity';
import { Payment } from '../modules/payments/entities/payment.entity';

dotenv.config();

// Function to parse DATABASE_URL
function parseDatabaseUrl(url: string) {
  const regex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid DATABASE_URL format');
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  ...(process.env.DATABASE_URL
    ? parseDatabaseUrl(process.env.DATABASE_URL)
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'vendor_payment_system',
      }),
  entities: [Vendor, PurchaseOrder, PurchaseOrderItem, Payment],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
