import { OrderPriority } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(OrderPriority)
  priority: OrderPriority;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
