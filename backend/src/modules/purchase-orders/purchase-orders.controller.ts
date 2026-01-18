import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dtos/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dtos/update-po-status.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PurchaseOrder } from './entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Purchase order created successfully',
    type: PurchaseOrder,
  })
  async create(createPODto: CreatePurchaseOrderDto, req) {
    return this.poService.create(createPODto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all purchase orders with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'vendorId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['Draft', 'Approved', 'Partially Paid', 'Fully Paid'],
  })
  @ApiQuery({ name: 'poNumber', required: false, type: String })
  async findAll(page = 1, limit = 20, vendorId?: string, status?: string, poNumber?: string) {
    return this.poService.findAll(page, limit, vendorId, status, poNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order details with payment history' })
  @ApiResponse({ status: 200, type: PurchaseOrder })
  async findOne(id: string) {
    return this.poService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiResponse({ status: 200, type: PurchaseOrder })
  async updateStatus(id: string, updateStatusDto: UpdatePOStatusDto, req) {
    return this.poService.updateStatus(id, updateStatusDto, req.user.id);
  }
}

;
export default PurchaseOrdersController;
