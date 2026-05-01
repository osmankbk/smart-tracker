import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ORDER_ACTIVITY_ACTIONS } from 'src/orders/constants/order-activity-actions';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForOrder(orderId: string, organizationId: string | null) {
    if (!organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return this.prisma.comment.findMany({
      where: {
        orderId,
        organizationId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createForOrder(
    orderId: string,
    dto: CreateCommentDto,
    authorId: string,
    organizationId: string | null,
  ) {
    if (!organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          orderId,
          organizationId,
          authorId,
          body: dto.body,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      await tx.activityLog.create({
        data: {
          orderId,
          actorId: authorId,
          action: ORDER_ACTIVITY_ACTIONS.COMMENT_ADDED,
        },
      });

      return comment;
    });
  }
}
