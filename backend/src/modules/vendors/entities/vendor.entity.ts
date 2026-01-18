import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';

export enum PaymentTerms {
  SEVEN_DAYS = 7,
  FIFTEEN_DAYS = 15,
  THIRTY_DAYS = 30,
  FORTY_FIVE_DAYS = 45,
  SIXTY_DAYS = 60,
}

export enum VendorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('vendors')
@Index('idx_vendor_email', ['email'])
@Index('idx_vendor_status', ['status'])
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.THIRTY_DAYS,
  })
  paymentTerms: PaymentTerms;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  status: VendorStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @OneToMany(() => PurchaseOrder, (po) => po.vendor)
  purchaseOrders: PurchaseOrder[];
}

;
export default Vendor;
