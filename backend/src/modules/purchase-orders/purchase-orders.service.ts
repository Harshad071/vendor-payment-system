import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, POStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from './dtos/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dtos/update-po-status.dto';
import { VendorsService } from '../vendors/vendors.service';
import { VendorStatus } from '../vendors/entities/vendor.entity';
import dayjs from 'dayjs';
import { Like } from 'typeorm';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private poItemRepository: Repository<PurchaseOrderItem>,
    private vendorsService: VendorsService,
  ) {}

  async generatePONumber(): Promise<string> {
    const today = dayjs().format('YYYYMMDD');
    const count = await this.poRepository.count({
      where: { poNumber: Like(`PO-${today}-%`) },
    });
    const sequence = String(count + 1).padStart(3, '0');
    return `PO-${today}-${sequence}`;
  }

  async create(
    createPODto: CreatePurchaseOrderDto,
    userId: string,
  ): Promise<PurchaseOrder> {
    // Validate vendor exists and is active
    const vendor = await this.vendorsService.findById(createPODto.vendorId);
    if (vendor.status !== VendorStatus.ACTIVE) {
      throw new BadRequestException('Cannot create PO for inactive vendor');
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    if (!createPODto.items || createPODto.items.length === 0) {
      throw new BadRequestException('PO must contain at least one item');
    }

    for (const item of createPODto.items) {
      if (item.quantity <= 0 || item.unitPrice <= 0) {
        throw new BadRequestException(
          'Quantity and unit price must be positive numbers',
        );
      }
      totalAmount += item.quantity * item.unitPrice;
    }

    // Generate PO number
    const poNumber = await this.generatePONumber();

    // Calculate due date
    const poDate = dayjs(createPODto.poDate);
    const dueDate = poDate.add(vendor.paymentTerms, 'days').toDate();

    // Create PO in transaction
    const po = this.poRepository.create({
      poNumber,
      vendorId: createPODto.vendorId,
      poDate: createPODto.poDate,
      totalAmount,
      dueDate,
      status: POStatus.DRAFT,
      notes: createPODto.notes,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedPO = await this.poRepository.save(po);

    // Create line items
    for (const item of createPODto.items) {
      const poItem = this.poItemRepository.create({
        purchaseOrderId: savedPO.id,
        ...item,
      });
      await this.poItemRepository.save(poItem);
    }

    // Reload with items
    return this.findById(savedPO.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    vendorId?: string,
    status?: string,
    poNumber?: string,
  ): Promise<{ data: PurchaseOrder[]; total: number; page: number; limit: number }> {
    const query = this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.payments', 'payments')
      .where('po.isDeleted = false');

    if (vendorId) {
      query.andWhere('po.vendorId = :vendorId', { vendorId });
    }

    if (status) {
      query.andWhere('po.status = :status', { status });
    }

    if (poNumber) {
      query.andWhere('po.poNumber LIKE :poNumber', { poNumber: `%${poNumber}%` });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('po.createdAt', 'DESC')
      .getMany();

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.payments', 'payments')
      .where('po.id = :id', { id })
      .getOne();

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return po;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdatePOStatusDto,
    userId: string,
  ): Promise<PurchaseOrder> {
    const po = await this.findById(id);

    // Validate status transition
    const validTransitions = {
      [POStatus.DRAFT]: [POStatus.APPROVED, POStatus.DRAFT],
      [POStatus.APPROVED]: [POStatus.PARTIALLY_PAID, POStatus.APPROVED],
      [POStatus.PARTIALLY_PAID]: [POStatus.FULLY_PAID, POStatus.PARTIALLY_PAID],
      [POStatus.FULLY_PAID]: [POStatus.FULLY_PAID],
    };

    if (!validTransitions[po.status].includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${po.status} to ${updateStatusDto.status}`,
      );
    }

    po.status = updateStatusDto.status;
    po.updatedBy = userId;
    return this.poRepository.save(po);
  }

  async updatePOStatusBasedOnPayments(poId: string, userId: string): Promise<void> {
    const po = await this.findById(poId);
    const totalPaid = po.payments.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0,
    );

    let newStatus = po.status;
    if (totalPaid >= Number(po.totalAmount)) {
      newStatus = POStatus.FULLY_PAID;
    } else if (totalPaid > 0) {
      newStatus = POStatus.PARTIALLY_PAID;
    }

    if (newStatus !== po.status) {
      po.status = newStatus;
      po.updatedBy = userId;
      await this.poRepository.save(po);
    }
  }
}

;
export default PurchaseOrdersService;
