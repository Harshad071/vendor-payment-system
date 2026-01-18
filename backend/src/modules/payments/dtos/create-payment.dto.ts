import {
  IsUUID,
  IsDate,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsString,
  Type,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  purchaseOrderId: string;

  @ApiProperty({ example: '2024-01-20T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @IsPositive()
  amountPaid: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: 'NEFT',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Invoice #12345', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

;
export default CreatePaymentDto;
