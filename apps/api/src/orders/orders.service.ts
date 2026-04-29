import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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

  create(createOrderDto: CreateOrderDto, createdById: string) {
    return this.prisma.order.create({
      data: {
        ...createOrderDto,
        createdById,
      },
      include: {
        assignee: true,
        createdBy: true,
      },
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        assignee: true,
        createdBy: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  async update(id: string, data: UpdateOrderDto) {
    const current = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if (
      current.status === 'CANCELED' &&
      data.status &&
      data.status !== 'CANCELED'
    ) {
      throw new BadRequestException(
        'Cannot change status once order is CANCELED',
      );
    }

    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        assignee: true,
        createdBy: true,
      },
    });
  }

  async cancel(id: string) {
    await this.findById(id); // make sure the order exists

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELED',
      },
    });
  }
}
