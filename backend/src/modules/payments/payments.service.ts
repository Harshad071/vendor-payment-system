import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import dayjs from 'dayjs';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private poService: PurchaseOrdersService,
    private dataSource: DataSource,
  ) {}

  async generatePaymentReference(): Promise<string> {
    const today = dayjs().format('YYYYMMDD');
    const count = await this.paymentRepository.count({
      where: { paymentReference: Like(`PAY-${today}-%`) },
    });
    const sequence = String(count + 1).padStart(3, '0');
    return `PAY-${today}-${sequence}`;
  }

  async recordPayment(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate PO exists
      const po = await this.poService.findById(createPaymentDto.purchaseOrderId);

      // Check outstanding amount
      const outstanding = po.getOutstandingAmount();
      if (createPaymentDto.amountPaid > outstanding) {
        throw new BadRequestException(
          `Payment amount (${createPaymentDto.amountPaid}) exceeds outstanding amount (${outstanding})`,
        );
      }

      // Generate payment reference
      const paymentReference = await this.generatePaymentReference();

      // Create payment
      const payment = this.paymentRepository.create({
        paymentReference,
        ...createPaymentDto,
        createdBy: userId,
      });

      const savedPayment = await queryRunner.manager.save(payment);

      // Update PO status based on payments
      await this.poService.updatePOStatusBasedOnPayments(
        createPaymentDto.purchaseOrderId,
        userId,
      );

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    poId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.purchaseOrder', 'po')
      .where('payment.isDeleted = false');

    if (poId) {
      query.andWhere('payment.purchaseOrderId = :poId', { poId });
    }

    if (startDate) {
      query.andWhere('payment.paymentDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('payment.paymentDate <= :endDate', { endDate });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.purchaseOrder', 'po')
      .where('payment.id = :id', { id })
      .andWhere('payment.isDeleted = false')
      .getOne();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async voidPayment(id: string, userId: string): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await this.findById(id);

      // Soft delete
      payment.isDeleted = true;
      const updated = await queryRunner.manager.save(payment);

      // Recalculate PO status
      await this.poService.updatePOStatusBasedOnPayments(
        payment.purchaseOrderId,
        userId,
      );

      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

;
export default PaymentsService;
