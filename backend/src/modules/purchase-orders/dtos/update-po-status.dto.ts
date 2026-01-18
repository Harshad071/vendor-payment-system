import { IsEnum } from 'class-validator';
import { POStatus } from '../entities/purchase-order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePOStatusDto {
  @ApiProperty({
    enum: POStatus,
    example: 'Approved',
  })
  @IsEnum(POStatus)
  status: POStatus;
}

;
export default UpdatePOStatusDto;
