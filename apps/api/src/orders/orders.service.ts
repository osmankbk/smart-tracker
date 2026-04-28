import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: {
        assignee: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: createOrderDto,
      include: {
        assignee: true,
        createdBy: true,
      },
    });
  }
}
