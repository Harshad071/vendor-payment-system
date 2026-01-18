import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dtos/create-vendor.dto';
import { UpdateVendorDto } from './dtos/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto, userId: string): Promise<Vendor> {
    // Check for existing vendor with same name or email
    const existingVendor = await this.vendorRepository.findOne({
      where: [{ name: createVendorDto.name }, { email: createVendorDto.email }],
    });

    if (existingVendor) {
      if (existingVendor.name === createVendorDto.name) {
        throw new ConflictException('Vendor with this name already exists');
      }
      throw new ConflictException('Vendor with this email already exists');
    }

    const vendor = this.vendorRepository.create({
      ...createVendorDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.vendorRepository.save(vendor);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ): Promise<{ data: Vendor[]; total: number; page: number; limit: number }> {
    const query = this.vendorRepository.createQueryBuilder('vendor');

    if (status) {
      query.where('vendor.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(vendor.name LIKE :search OR vendor.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('vendor.createdAt', 'DESC')
      .getMany();

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['purchaseOrders', 'purchaseOrders.payments'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(
    id: string,
    updateVendorDto: UpdateVendorDto,
    userId: string,
  ): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    if (updateVendorDto.email && updateVendorDto.email !== vendor.email) {
      const existing = await this.vendorRepository.findOne({
        where: { email: updateVendorDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(vendor, updateVendorDto, { updatedBy: userId });
    return this.vendorRepository.save(vendor);
  }

  async getVendorWithPaymentSummary(id: string) {
    const vendor = await this.findById(id);
    const purchaseOrders = await this.vendorRepository.manager
      .createQueryBuilder(Vendor, 'vendor')
      .leftJoinAndSelect('vendor.purchaseOrders', 'po')
      .leftJoinAndSelect('po.payments', 'payment')
      .where('vendor.id = :id', { id })
      .getOne();

    let totalOutstanding = 0;
    let totalPaid = 0;

    purchaseOrders?.purchaseOrders?.forEach((po) => {
      totalOutstanding += Number(po.totalAmount) - (po.getOutstandingAmount ? po.getOutstandingAmount() : 0);
      const paid = po.payments?.reduce((sum, p) => sum + Number(p.amountPaid), 0) || 0;
      totalPaid += paid;
    });

    return {
      vendor,
      summary: {
        totalPurchaseOrders: purchaseOrders?.purchaseOrders?.length || 0,
        totalOutstanding: totalOutstanding,
        totalPaid,
      },
    };
  }
}

;
export default VendorsService;
