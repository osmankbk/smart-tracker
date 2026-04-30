import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { IntelligenceService } from '../intelligence/intelligence.service';
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

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
        activityLogs: {
          include: {
            actor: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return {
      ...order,
      intelligence: this.intelligenceService.analyzeOrder(order),
    };
  }

  async update(id: string, data: UpdateOrderDto, actorId?: string) {
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
    if (current.status === 'DONE' && data.status && data.status !== 'DONE') {
      throw new BadRequestException('Cannot change status once order is DONE');
    }

    await this.prisma.order.update({
      where: { id },
      data,
    });

    // 🔥 LOG THE CHANGE
    if (data.status && data.status !== current.status) {
      await this.prisma.activityLog.create({
        data: {
          orderId: id,
          actorId,
          action: 'STATUS_CHANGED',
          fromStatus: current.status,
          toStatus: data.status,
        },
      });
    }

    return this.prisma.order.findUnique({
      where: { id },
      include: {
        assignee: true,
        createdBy: true,
        activityLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async cancel(id: string, actorId?: string) {
    const current = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELED',
      },
    });

    await this.prisma.activityLog.create({
      data: {
        orderId: id,
        actorId,
        action: 'CANCELED',
        fromStatus: current.status,
        toStatus: 'CANCELED',
      },
    });

    return updated;
  }
}
