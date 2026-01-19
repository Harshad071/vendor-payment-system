import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Payment } from './entities/payment.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a payment against a purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully',
    type: Payment,
  })
  async recordPayment(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentsService.recordPayment(createPaymentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all payments with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'poId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('poId') poId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.findAll(
      page,
      limit,
      poId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, type: Payment })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void a payment (soft delete)' })
  @ApiResponse({ status: 200, description: 'Payment voided successfully' })
  async voidPayment(@Param('id') id: string, @Req() req) {
    return this.paymentsService.voidPayment(id, req.user.id);
  }
}

;
export default PaymentsController;
