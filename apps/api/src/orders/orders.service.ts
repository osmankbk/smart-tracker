import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ORDER_ACTIVITY_ACTIONS } from './constants/order-activity-actions';

import { IntelligenceService } from '../intelligence/intelligence.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  findAll(organizationId: string | null) {
    return this.prisma.order.findMany({
      where: {
        organizationId,
      },
      include: {
        assignee: true,
        createdBy: true,
        statusRef: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    createOrderDto: CreateOrderDto,
    createdById: string,
    organizationId: string | null,
  ) {
    if (!organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    return this.prisma.$transaction(async (tx) => {
      const defaultWorkflow = await tx.workflow.findFirst({
        where: {
          organizationId,
        },
      });

      if (!defaultWorkflow) {
        throw new BadRequestException('No workflow found for organization');
      }

      const startStatus = await tx.workflowStatus.findFirst({
        where: {
          workflowId: defaultWorkflow.id,
          isStart: true,
        },
      });

      if (!startStatus) {
        throw new BadRequestException('Workflow has no start status');
      }

      const order = await tx.order.create({
        data: {
          ...createOrderDto,
          createdById,
          organizationId,
          workflowId: defaultWorkflow.id,
          statusId: startStatus.id,
          status: startStatus.key as any,
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

  async findById(id: string, organizationId?: string | null) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        assignee: true,
        createdBy: true,
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
      include: {
        statusRef: true,
      },
    });

    if (!current) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const nextStatusRef = data.statusId
      ? await this.prisma.workflowStatus.findUnique({
          where: {
            id: data.statusId,
          },
        })
      : null;

    if (data.statusId && !nextStatusRef) {
      throw new BadRequestException('Selected status does not exist');
    }

    if (nextStatusRef && nextStatusRef.id !== current.statusId) {
      if (!current.workflowId || !current.statusId) {
        throw new BadRequestException(
          'Order is missing workflow status data. Please backfill workflow data.',
        );
      }

      const allowedTransition = await this.prisma.workflowTransition.findUnique(
        {
          where: {
            workflowId_fromStatusId_toStatusId: {
              workflowId: current.workflowId,
              fromStatusId: current.statusId,
              toStatusId: nextStatusRef.id,
            },
          },
        },
      );

      if (!allowedTransition) {
        throw new BadRequestException(
          `Transition from ${current.statusRef?.name ?? current.status} to ${
            nextStatusRef.name
          } is not allowed.`,
        );
      }
    }

    const currentCategory = current.statusRef?.category ?? current.status;
    const nextCategory = nextStatusRef?.category;

    if (
      currentCategory === 'CANCELED' &&
      nextCategory &&
      nextCategory !== 'CANCELED'
    ) {
      throw new BadRequestException(
        'Cannot change status once order is CANCELED',
      );
    }

    if (currentCategory === 'DONE' && nextCategory && nextCategory !== 'DONE') {
      throw new BadRequestException('Cannot change status once order is DONE');
    }

    const isWorkflowStatusChanging = Boolean(
      nextStatusRef && nextStatusRef.id !== current.statusId,
    );

    const isRegression = Boolean(
      current.statusRef &&
      nextStatusRef &&
      nextStatusRef.order < current.statusRef.order,
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          assigneeId: data.assigneeId,

          ...(nextStatusRef
            ? {
                statusId: nextStatusRef.id,
                status: nextStatusRef.key as any,
              }
            : {}),
        },
      });

      if (isWorkflowStatusChanging && nextStatusRef) {
        await tx.activityLog.create({
          data: {
            orderId: id,
            actorId,
            action: isRegression
              ? ORDER_ACTIVITY_ACTIONS.STATUS_REGRESSION
              : ORDER_ACTIVITY_ACTIONS.STATUS_CHANGED,
            fromStatus: current.status,
            toStatus: nextStatusRef.key as any,
          },
        });
      }

      return tx.order.findUnique({
        where: { id },
        include: {
          assignee: true,
          createdBy: true,
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
}
