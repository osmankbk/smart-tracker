import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum OrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(OrderPriority)
  priority: OrderPriority;
}
