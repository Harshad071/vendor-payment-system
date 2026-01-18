import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum POStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  PARTIALLY_PAID = 'Partially Paid',
  FULLY_PAID = 'Fully Paid',
}

@Entity('purchase_orders')
@Index('idx_po_vendor', ['vendorId'])
@Index('idx_po_status', ['status'])
@Index('idx_po_number', ['poNumber'], { unique: true })
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  poNumber: string;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.purchaseOrders)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column()
  poDate: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column()
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
  })
  items: PurchaseOrderItem[];

  @OneToMany(() => Payment, (payment) => payment.purchaseOrder)
  payments: Payment[];

  // Calculated field for outstanding amount
  getOutstandingAmount(): number {
    const totalPaid = this.payments?.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0,
    ) || 0;
    return Number(this.totalAmount) - totalPaid;
  }
}

;
export default PurchaseOrder;
