import {
  Controller,
  Get,
  Post,
  Put,
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
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dtos/create-vendor.dto';
import { UpdateVendorDto } from './dtos/update-vendor.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Vendor } from './entities/vendor.entity';

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({
    status: 201,
    description: 'Vendor created successfully',
    type: Vendor,
  })
  async create(createVendorDto: CreateVendorDto, req) {
    return this.vendorsService.create(createVendorDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['Active', 'Inactive'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(page = 1, limit = 20, status?: string, search?: string) {
    return this.vendorsService.findAll(page, limit, status, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor details with payment summary' })
  @ApiResponse({ status: 200, type: Vendor })
  async findOne(id: string) {
    return this.vendorsService.getVendorWithPaymentSummary(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vendor information' })
  @ApiResponse({ status: 200, type: Vendor })
  async update(id: string, updateVendorDto: UpdateVendorDto, req) {
    return this.vendorsService.update(id, updateVendorDto, req.user.id);
  }
}

;
export default VendorsController;
