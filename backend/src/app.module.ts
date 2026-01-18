import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { Vendor } from './modules/vendors/entities/vendor.entity';
import { PurchaseOrder } from './modules/purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from './modules/purchase-orders/entities/purchase-order-item.entity';
import { Payment } from './modules/payments/entities/payment.entity';

// Function to parse DATABASE_URL
function parseDatabaseUrl(databaseUrl: string) {
  const url = require('url');
  const parsed = url.parse(databaseUrl);
  if (parsed.protocol !== 'mysql:') throw new Error('Invalid DATABASE_URL protocol');
  const [username, password] = parsed.auth.split(':');
  const host = parsed.hostname;
  const port = parseInt(parsed.port || '3306');
  const database = parsed.pathname.slice(1); // remove leading /
  return { username, password, host, port, database };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
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
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    VendorsModule,
    PurchaseOrdersModule,
    PaymentsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

;
export default AppModule;
