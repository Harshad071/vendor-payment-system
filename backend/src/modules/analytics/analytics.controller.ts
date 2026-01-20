import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService, AgingItem } from './analytics.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vendor-outstanding')
  @ApiOperation({ summary: 'Get outstanding balance by vendor' })
  @ApiQuery({ name: 'vendorId', required: false, type: String, description: 'Filter by specific vendor ID' })
  @ApiResponse({
    status: 200,
    description: 'Vendor outstanding balances',
  })
  async getVendorOutstanding(@Query('vendorId') vendorId?: string) {
    return this.analyticsService.getVendorOutstanding(vendorId);
  }

  @Get('payment-aging')
  @ApiOperation({ summary: 'Get payment aging report (0-30, 31-60, 61-90, 90+ days)' })
  @ApiQuery({ name: 'vendorId', required: false, type: String, description: 'Filter by specific vendor ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment aging analysis',
  })
  async getPaymentAging(@Query('vendorId') vendorId?: string) {
    return this.analyticsService.getPaymentAging(vendorId);
  }

  @Get('payment-trends')
  @ApiOperation({ summary: 'Get monthly payment trends for last 6 months' })
  @ApiResponse({
    status: 200,
    description: 'Payment trends over time',
  })
  async getPaymentTrends() {
    return this.analyticsService.getPaymentTrends();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary',
  })
  async getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }
}

;
export default AnalyticsController;
