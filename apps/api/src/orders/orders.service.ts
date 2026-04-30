import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ORDER_ACTIVITY_ACTIONS } from './constants/order-activity-actions';

import { IntelligenceService } from '../intelligence/intelligence.service';
import { OrderStatus } from '@prisma/client';
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

  async create(createOrderDto: CreateOrderDto, createdById: string) {
    return this.prisma.$transaction(async (tx) => {
      const defaultWorkflow = await tx.workflow.findUnique({
        where: {
          id: 'default_workflow',
        },
      });

      if (!defaultWorkflow) {
        throw new Error('Default workflow is not configured');
      }

      const startStatus = await tx.workflowStatus.findFirst({
        where: {
          workflowId: defaultWorkflow.id,
          isStart: true,
        },
      });

      if (!startStatus) {
        throw new InternalServerErrorException(
          'Default workflow is not configured',
        );
      }

      const order = await tx.order.create({
        data: {
          ...createOrderDto,
          createdById,
          workflowId: defaultWorkflow.id,
          statusId: startStatus.id,

          // Temporary compatibility field.
          // Existing code still reads Order.status enum.
          status: startStatus.key as OrderStatus,
        },
      });

      await tx.activityLog.create({
        data: {
          orderId: order.id,
          actorId: createdById,
          action: ORDER_ACTIVITY_ACTIONS.CREATED,
          fromStatus: null,
          toStatus: order.status,
        },
      });

      return tx.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          assignee: true,
          createdBy: true,
          workflow: true,
          statusRef: true,
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
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        assignee: true,
        createdBy: true,
        statusRef: true,
        activityLogs: {
          include: { actor: true },
          orderBy: { createdAt: 'desc' },
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

    const isStatusChanging = Boolean(
      data.status && data.status !== current.status,
    );

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

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data,
      });

      if (isStatusChanging) {
        await tx.activityLog.create({
          data: {
            orderId: id,
            actorId,
            action: ORDER_ACTIVITY_ACTIONS.STATUS_CHANGED,
            fromStatus: current.status,
            toStatus: data.status,
          },
        });
      }

      return tx.order.findUnique({
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
    });
  }

  async cancel(id: string, actorId?: string) {
    const current = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if (current.status === 'CANCELED') {
      return this.findById(id);
    }

    if (current.status === 'DONE') {
      throw new BadRequestException('Cannot cancel an order once it is DONE');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELED',
        },
      });

      await tx.activityLog.create({
        data: {
          orderId: id,
          actorId,
          action: ORDER_ACTIVITY_ACTIONS.CANCELED,
          fromStatus: current.status,
          toStatus: 'CANCELED',
        },
      });

      return tx.order.findUnique({
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
    });
  }
}
