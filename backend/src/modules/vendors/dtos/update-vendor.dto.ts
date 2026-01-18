import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { PaymentTerms, VendorStatus } from '../entities/vendor.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiProperty({ example: 'ABC Supplies Ltd', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: 'vendor@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+91-9876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: PaymentTerms,
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiProperty({
    enum: VendorStatus,
    example: 'Active',
    required: false,
  })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;
}

;
export default UpdateVendorDto;
