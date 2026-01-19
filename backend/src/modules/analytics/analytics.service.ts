import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Payment } from '../payments/entities/payment.entity';
import dayjs from 'dayjs';

export interface AgingItem {
  poNumber: string;
  vendorName: string;
  poDate: Date;
  dueDate: Date;
  outstanding: number;
  daysOverdue: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async getVendorOutstanding() {
    const vendors = await this.vendorRepository
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.purchaseOrders', 'po')
      .leftJoinAndSelect('po.payments', 'payment')
      .where('po.isDeleted = false')
      .andWhere('payment.isDeleted = false OR payment IS NULL')
      .getMany();

    const result = vendors.map((vendor) => {
      let totalPOAmount = 0;
      let totalPaid = 0;

      vendor.purchaseOrders?.forEach((po) => {
        totalPOAmount += Number(po.totalAmount);
        po.payments?.forEach((payment) => {
          totalPaid += Number(payment.amountPaid);
        });
      });

      return {
        vendorId: vendor.id,
        vendorName: vendor.name,
        email: vendor.email,
        totalPOAmount,
        totalPaid,
        outstanding: totalPOAmount - totalPaid,
        numberOfPOs: vendor.purchaseOrders?.length || 0,
      };
    });

    return result.filter((r) => r.outstanding > 0);
  }

  async getPaymentAging() {
    const pos = await this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.payments', 'payment')
      .where('po.isDeleted = false')
      .getMany();

    const today = dayjs();
    const agingBuckets: Record<string, AgingItem[]> = {
      current: [], // 0-30 days overdue
      thirtyPlus: [], // 31-60 days
      sixtyPlus: [], // 61-90 days
      ninetyPlus: [], // 90+ days
    };

    pos.forEach((po) => {
      const totalPaid = po.payments
        ?.filter((p) => !p.isDeleted)
        .reduce((sum, p) => sum + Number(p.amountPaid), 0) || 0;
      const outstanding = Number(po.totalAmount) - totalPaid;

      if (outstanding > 0) {
        const daysOverdue = today.diff(dayjs(po.dueDate), 'days');

        const item = {
          poNumber: po.poNumber,
          vendorName: po.vendor.name,
          poDate: po.poDate,
          dueDate: po.dueDate,
          outstanding,
          daysOverdue,
        };

        if (daysOverdue <= 30) {
          agingBuckets.current.push(item);
        } else if (daysOverdue <= 60) {
          agingBuckets.thirtyPlus.push(item);
        } else if (daysOverdue <= 90) {
          agingBuckets.sixtyPlus.push(item);
        } else {
          agingBuckets.ninetyPlus.push(item);
        }
      }
    });

    const totals = {
      current: agingBuckets.current.reduce((sum, i) => sum + i.outstanding, 0),
      thirtyPlus: agingBuckets.thirtyPlus.reduce(
        (sum, i) => sum + i.outstanding,
        0,
      ),
      sixtyPlus: agingBuckets.sixtyPlus.reduce(
        (sum, i) => sum + i.outstanding,
        0,
      ),
      ninetyPlus: agingBuckets.ninetyPlus.reduce(
        (sum, i) => sum + i.outstanding,
        0,
      ),
    };

    return {
      buckets: agingBuckets,
      summary: {
        '0-30 Days': {
          count: agingBuckets.current.length,
          total: totals.current,
        },
        '31-60 Days': {
          count: agingBuckets.thirtyPlus.length,
          total: totals.thirtyPlus,
        },
        '61-90 Days': {
          count: agingBuckets.sixtyPlus.length,
          total: totals.sixtyPlus,
        },
        '90+ Days': {
          count: agingBuckets.ninetyPlus.length,
          total: totals.ninetyPlus,
        },
      },
    };
  }

  async getPaymentTrends() {
    const sixMonthsAgo = dayjs().subtract(6, 'months').toDate();

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.paymentDate >= :date', { date: sixMonthsAgo })
      .andWhere('payment.isDeleted = false')
      .orderBy('payment.paymentDate', 'ASC')
      .getMany();

    const trends: Record<string, number> = {};

    payments.forEach((payment) => {
      const month = dayjs(payment.paymentDate).format('YYYY-MM');
      trends[month] = (trends[month] || 0) + Number(payment.amountPaid);
    });

    // Fill in missing months with 0
    let currentMonth = dayjs().subtract(5, 'months');
    for (let i = 0; i < 6; i++) {
      const monthKey = currentMonth.format('YYYY-MM');
      if (!trends[monthKey]) {
        trends[monthKey] = 0;
      }
      currentMonth = currentMonth.add(1, 'month');
    }

    return Object.entries(trends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month,
        totalAmount: amount,
      }));
  }

  async getDashboardSummary() {
    const [vendors, pos, payments] = await Promise.all([
      this.vendorRepository.count(),
      this.poRepository.count({ where: { isDeleted: false } }),
      this.paymentRepository.find({ where: { isDeleted: false } }),
    ]);

    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0,
    );

    return {
      totalVendors: vendors,
      totalPOs: pos,
      totalPaymentsRecorded: payments.length,
      totalAmountPaid: totalPaid,
    };
  }
}

;
export default AnalyticsService;
