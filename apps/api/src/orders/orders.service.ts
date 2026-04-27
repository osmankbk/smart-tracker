import { Injectable } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';

export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export type Order = {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: OrderStatus;
  createdAt: string;
};

@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [];

  findAll() {
    return this.orders;
  }

  create(createOrderDto: CreateOrderDto) {
    const order: Order = {
      id: `order_${Date.now()}`,
      ...createOrderDto,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);

    return order;
  }
}
