import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsDate,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  Type,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePOItemDto {
  @ApiProperty({ example: 'Premium Widgets' })
  @IsString()
  description: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 50.5 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  poDate: Date;

  @ApiProperty({
    type: [CreatePOItemDto],
    example: [
      { description: 'Item 1', quantity: 10, unitPrice: 100 },
      { description: 'Item 2', quantity: 5, unitPrice: 200 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePOItemDto)
  items: CreatePOItemDto[];

  @ApiProperty({ example: 'Initial order for Q1', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

;
export default CreatePurchaseOrderDto;
