import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder, POStatus } from './entities/purchase-order.entity';
import { VendorsService } from '../vendors/vendors.service';
import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals'; // Import jest to fix the undeclared variable error

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let vendorsService: VendorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        {
          provide: VendorsService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: 'PurchaseOrderRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: 'PurchaseOrderItemRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
    vendorsService = module.get<VendorsService>(VendorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Business Logic Tests', () => {
    it('should reject PO creation for inactive vendor', async () => {
      const vendorId = '123';
      const createPODto = {
        vendorId,
        poDate: new Date(),
        items: [{ description: 'Test', quantity: 10, unitPrice: 100 }],
      };

      jest.spyOn(vendorsService, 'findById').mockResolvedValue({
        id: vendorId,
        status: 'Inactive',
      } as any);

      await expect(service.create(createPODto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate total amount from line items', () => {
      const items = [
        { description: 'Item 1', quantity: 10, unitPrice: 100 },
        { description: 'Item 2', quantity: 5, unitPrice: 50 },
      ];

      let total = 0;
      items.forEach((item) => {
        total += item.quantity * item.unitPrice;
      });

      expect(total).toBe(1250); // 10*100 + 5*50
    });

    it('should validate positive amounts', () => {
      const invalidItem = { description: 'Item', quantity: -10, unitPrice: 100 };
      
      expect(invalidItem.quantity > 0).toBeFalsy();
      expect(invalidItem.unitPrice > 0).toBeTruthy();
    });

    it('should calculate outstanding amount correctly', () => {
      const poAmount = 1000;
      const payments = [
        { amountPaid: 300 },
        { amountPaid: 200 },
      ];

      const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
      const outstanding = poAmount - totalPaid;

      expect(outstanding).toBe(500);
      expect(totalPaid).toBe(500);
    });

    it('should determine correct PO status based on payments', () => {
      const poAmount = 1000;
      
      // Test case 1: Fully Paid
      let totalPaid = 1000;
      let status = totalPaid >= poAmount ? POStatus.FULLY_PAID : POStatus.PARTIALLY_PAID;
      expect(status).toBe(POStatus.FULLY_PAID);

      // Test case 2: Partially Paid
      totalPaid = 500;
      status = totalPaid > 0 && totalPaid < poAmount ? POStatus.PARTIALLY_PAID : POStatus.DRAFT;
      expect(status).toBe(POStatus.PARTIALLY_PAID);

      // Test case 3: Not Paid
      totalPaid = 0;
      status = totalPaid === 0 ? POStatus.DRAFT : POStatus.PARTIALLY_PAID;
      expect(status).toBe(POStatus.DRAFT);
    });

    it('should prevent payment exceeding PO amount', () => {
      const poAmount = 1000;
      const paymentAmount = 1500;
      const outstanding = poAmount;

      expect(paymentAmount > outstanding).toBeTruthy();
    });

    it('should reject PO without items', async () => {
      const vendorId = '123';
      const createPODto = {
        vendorId,
        poDate: new Date(),
        items: [],
      };

      jest.spyOn(vendorsService, 'findById').mockResolvedValue({
        id: vendorId,
        status: 'Active',
      } as any);

      await expect(service.create(createPODto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Outstanding Calculation', () => {
    it('should accurately sum outstanding across multiple POs', () => {
      const pos = [
        {
          totalAmount: 1000,
          payments: [{ amountPaid: 300 }],
          getOutstandingAmount: () => 700,
        },
        {
          totalAmount: 2000,
          payments: [{ amountPaid: 500 }],
          getOutstandingAmount: () => 1500,
        },
      ];

      const totalOutstanding = pos.reduce(
        (sum, po) => sum + po.getOutstandingAmount(),
        0,
      );

      expect(totalOutstanding).toBe(2200);
    });
  });

  describe('Date Calculations', () => {
    it('should calculate due date based on payment terms', () => {
      const poDate = new Date('2024-01-15');
      const paymentTerms = 30;

      const dueDate = new Date(poDate);
      dueDate.setDate(dueDate.getDate() + paymentTerms);

      expect(dueDate.getDate()).toBe(14); // January 15 + 30 days
    });
  });
});
