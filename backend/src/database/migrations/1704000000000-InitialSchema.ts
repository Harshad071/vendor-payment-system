import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vendors table
    await queryRunner.createTable(
      new Table({
        name: 'vendors',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'contactPerson',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'paymentTerms',
            type: 'enum',
            enum: ['7', '15', '30', '45', '60'],
            default: "'30'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Active', 'Inactive'],
            default: "'Active'",
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'idx_vendor_email',
            columnNames: ['email'],
          },
          {
            name: 'idx_vendor_status',
            columnNames: ['status'],
          },
        ],
      }),
    );

    // Create purchase_orders table
    await queryRunner.createTable(
      new Table({
        name: 'purchase_orders',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'poNumber',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'vendorId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'poDate',
            type: 'datetime',
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'dueDate',
            type: 'datetime',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Draft', 'Approved', 'Partially Paid', 'Fully Paid'],
            default: "'Draft'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['vendorId'],
            referencedTableName: 'vendors',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'idx_po_vendor',
            columnNames: ['vendorId'],
          },
          {
            name: 'idx_po_status',
            columnNames: ['status'],
          },
          {
            name: 'idx_po_number',
            columnNames: ['poNumber'],
            isUnique: true,
          },
        ],
      }),
    );

    // Create purchase_order_items table
    await queryRunner.createTable(
      new Table({
        name: 'purchase_order_items',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'purchaseOrderId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['purchaseOrderId'],
            referencedTableName: 'purchase_orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'idx_poi_po',
            columnNames: ['purchaseOrderId'],
          },
        ],
      }),
    );

    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'paymentReference',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'purchaseOrderId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'paymentDate',
            type: 'datetime',
          },
          {
            name: 'amountPaid',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'paymentMethod',
            type: 'enum',
            enum: ['Cash', 'Cheque', 'NEFT', 'RTGS', 'UPI'],
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['purchaseOrderId'],
            referencedTableName: 'purchase_orders',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'idx_payment_po',
            columnNames: ['purchaseOrderId'],
          },
          {
            name: 'idx_payment_date',
            columnNames: ['paymentDate'],
          },
          {
            name: 'idx_payment_reference',
            columnNames: ['paymentReference'],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
    await queryRunner.dropTable('purchase_order_items');
    await queryRunner.dropTable('purchase_orders');
    await queryRunner.dropTable('vendors');
  }
}
