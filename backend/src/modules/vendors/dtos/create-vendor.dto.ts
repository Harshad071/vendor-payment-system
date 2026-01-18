import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';
import { PaymentTerms, VendorStatus } from '../entities/vendor.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'ABC Supplies Ltd' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: 'vendor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91-9876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: PaymentTerms,
    example: 30,
    description: 'Payment terms in days (7, 15, 30, 45, 60)',
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
export default CreateVendorDto;
