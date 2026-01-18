import { AppDataSource } from '../ormconfig';
import { Vendor, VendorStatus, PaymentTerms } from '../../modules/vendors/entities/vendor.entity';
import { PurchaseOrder, POStatus } from '../../modules/purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../../modules/purchase-orders/entities/purchase-order-item.entity';
import { Payment, PaymentMethod } from '../../modules/payments/entities/payment.entity';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

async function seed() {
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();

    console.log('Seeding database...');

    // Create vendors
    const vendors: Vendor[] = [];
    const vendorData = [
      {
        name: 'ABC Electronics Ltd',
        contactPerson: 'Rajesh Kumar',
        email: 'info@abcelectronics.com',
        phone: '+91-9876543210',
        paymentTerms: PaymentTerms.THIRTY_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'Premier Industrial Supplies',
        contactPerson: 'Priya Sharma',
        email: 'sales@premierindustrial.com',
        phone: '+91-8765432109',
        paymentTerms: PaymentTerms.FORTY_FIVE_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'Global Materials Trading',
        contactPerson: 'Arjun Singh',
        email: 'contact@globalmaterials.com',
        phone: '+91-7654321098',
        paymentTerms: PaymentTerms.SIXTY_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'Swift Logistics Inc',
        contactPerson: 'Meera Patel',
        email: 'support@swiftlogistics.com',
        phone: '+91-6543210987',
        paymentTerms: PaymentTerms.FIFTEEN_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'EcoTech Solutions',
        contactPerson: 'Vikram Gupta',
        email: 'hello@ecotech.com',
        phone: '+91-5432109876',
        paymentTerms: PaymentTerms.THIRTY_DAYS,
        status: VendorStatus.INACTIVE,
      },
    ];

    for (const data of vendorData) {
      const vendor = new Vendor();
      Object.assign(vendor, data, { id: uuid(), createdBy: '1', updatedBy: '1' });
      vendors.push(await queryRunner.manager.save(vendor));
    }

    console.log(`✓ Created ${vendors.length} vendors`);

    // Create purchase orders and items
    const pos: PurchaseOrder[] = [];
    const poItemsData = [
      [
        { description: 'Electronic Components - Resistors', quantity: 1000, unitPrice: 2.5 },
        { description: 'Electronic Components - Capacitors', quantity: 500, unitPrice: 5.0 },
      ],
      [
        { description: 'Industrial Switches', quantity: 50, unitPrice: 150 },
        { description: 'Cable Connectors', quantity: 200, unitPrice: 25 },
      ],
      [
        { description: 'Raw Steel - Grade A', quantity: 100, unitPrice: 500 },
      ],
      [
        { description: 'Packaging Materials', quantity: 5000, unitPrice: 1.2 },
        { description: 'Protective Equipment', quantity: 100, unitPrice: 75 },
      ],
      [
        { description: 'Software Licenses', quantity: 10, unitPrice: 2000 },
      ],
      [
        { description: 'Industrial Motors', quantity: 25, unitPrice: 800 },
        { description: 'Motor Bearings', quantity: 100, unitPrice: 120 },
        { description: 'Motor Mounting Brackets', quantity: 50, unitPrice: 45 },
      ],
      [
        { description: 'Chemical Reagents', quantity: 50, unitPrice: 300 },
        { description: 'Laboratory Equipment', quantity: 5, unitPrice: 5000 },
      ],
      [
        { description: 'Office Furniture - Desks', quantity: 20, unitPrice: 400 },
        { description: 'Office Chairs', quantity: 50, unitPrice: 200 },
      ],
      [
        { description: 'Computing Equipment', quantity: 15, unitPrice: 1500 },
      ],
      [
        { description: 'Hydraulic Fluid - Premium Grade', quantity: 200, unitPrice: 85 },
        { description: 'Hydraulic Filters', quantity: 100, unitPrice: 45 },
        { description: 'Hydraulic Hoses - 1 inch', quantity: 500, unitPrice: 12 },
      ],
      [
        { description: 'Stainless Steel Sheets - 2mm', quantity: 50, unitPrice: 350 },
        { description: 'Aluminum Profiles', quantity: 100, unitPrice: 80 },
      ],
      [
        { description: 'Safety Helmets', quantity: 200, unitPrice: 25 },
        { description: 'Safety Gloves - Pack of 10', quantity: 100, unitPrice: 40 },
      ],
      [
        { description: 'Pneumatic Tools - Drill', quantity: 10, unitPrice: 450 },
        { description: 'Pneumatic Tools - Grinder', quantity: 8, unitPrice: 550 },
      ],
      [
        { description: 'Network Cables - Cat6', quantity: 1000, unitPrice: 2.5 },
        { description: 'Network Switches', quantity: 5, unitPrice: 1200 },
      ],
      [
        { description: 'Rubber Seals - Assorted', quantity: 500, unitPrice: 8 },
        { description: 'Gaskets - Standard', quantity: 300, unitPrice: 12 },
      ],
    ];

    for (let i = 0; i < 15; i++) {
      const poNumber = `PO-${dayjs().subtract(i * 5, 'days').format('YYYYMMDD')}-${String(i + 1).padStart(3, '0')}`;
      const poDate = dayjs().subtract(i * 5, 'days').toDate();
      const vendor = vendors[i % vendors.length];

      // Calculate total amount
      let totalAmount = 0;
      const items = poItemsData[i % poItemsData.length];
      items.forEach((item) => {
        totalAmount += item.quantity * item.unitPrice;
      });

      const dueDate = dayjs(poDate).add(vendor.paymentTerms, 'days').toDate();

      const po = new PurchaseOrder();
      po.id = uuid();
      po.poNumber = poNumber;
      po.vendorId = vendor.id;
      po.vendor = vendor;
      po.poDate = poDate;
      po.totalAmount = totalAmount;
      po.dueDate = dueDate;
      po.status = POStatus.APPROVED;
      po.createdBy = '1';
      po.updatedBy = '1';

      const savedPO = await queryRunner.manager.save(po);

      // Create line items
      for (const item of items) {
        const poItem = new PurchaseOrderItem();
        poItem.id = uuid();
        poItem.purchaseOrderId = savedPO.id;
        poItem.purchaseOrder = savedPO;
        poItem.description = item.description;
        poItem.quantity = item.quantity;
        poItem.unitPrice = item.unitPrice;
        await queryRunner.manager.save(poItem);
      }

      pos.push(savedPO);
    }

    console.log(`✓ Created ${pos.length} purchase orders`);

    // Create payments
    let paymentCount = 0;
    for (let i = 0; i < pos.length; i++) {
      const po = pos[i];
      let amountRemaining = po.totalAmount;
      let paymentDate = dayjs(po.poDate).add(5, 'days').toDate();

      while (amountRemaining > 0 && paymentCount < 10) {
        const payment = new Payment();
        payment.id = uuid();
        payment.paymentReference = `PAY-${dayjs(paymentDate).format('YYYYMMDD')}-${String(paymentCount + 1).padStart(3, '0')}`;
        payment.purchaseOrderId = po.id;
        payment.purchaseOrder = po;
        payment.paymentDate = paymentDate;

        // Pay random amounts, but not more than outstanding
        const paymentAmount = Math.min(amountRemaining * 0.5, amountRemaining);
        payment.amountPaid = paymentAmount;
        payment.paymentMethod = [
          PaymentMethod.NEFT,
          PaymentMethod.RTGS,
          PaymentMethod.CHEQUE,
          PaymentMethod.UPI,
        ][Math.floor(Math.random() * 4)];
        payment.notes = `Payment for ${po.poNumber}`;
        payment.createdBy = '1';

        await queryRunner.manager.save(payment);
        amountRemaining -= paymentAmount;
        paymentDate = dayjs(paymentDate).add(7, 'days').toDate();
        paymentCount++;
      }

      // Update PO status based on payments
      if (amountRemaining <= 0) {
        po.status = POStatus.FULLY_PAID;
      } else {
        po.status = POStatus.PARTIALLY_PAID;
      }
      await queryRunner.manager.save(po);
    }

    console.log(`✓ Created ${paymentCount} payments`);

    console.log('\n✓ Seed completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
