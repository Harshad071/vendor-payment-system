import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';

export enum PaymentMethod {
  CASH = 'Cash',
  CHEQUE = 'Cheque',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  UPI = 'UPI',
}

@Entity('payments')
@Index('idx_payment_po', ['purchaseOrderId'])
@Index('idx_payment_date', ['paymentDate'])
@Index('idx_payment_reference', ['paymentReference'], { unique: true })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentReference: string;

  @Column()
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.payments)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @Column()
  paymentDate: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  amountPaid: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ default: false })
  isDeleted: boolean; // Soft delete for void operations
}

;
export default Payment;
