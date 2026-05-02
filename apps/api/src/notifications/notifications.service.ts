import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type CreateMentionNotificationInput = {
  organizationId: string | null;
  userId: string;
  actorId: string;
  orderId: string;
  commentId: string;
  actorNameOrEmail: string;
  orderTitle: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string, organizationId: string | null) {
    if (!organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    return this.prisma.notification.findMany({
      where: {
        userId,
        organizationId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        order: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createMentionNotification(input: CreateMentionNotificationInput) {
    if (!input.organizationId) {
      throw new BadRequestException('Organization is required');
    }

    if (input.userId === input.actorId) {
      return null;
    }

    return this.prisma.notification.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        actorId: input.actorId,
        orderId: input.orderId,
        commentId: input.commentId,
        type: NotificationType.MENTION,
        title: `${input.actorNameOrEmail} mentioned you`,
        body: `You were mentioned on "${input.orderTitle}".`,
      },
    });
  }

  async markAsRead(
    notificationId: string,
    userId: string,
    organizationId: string | null,
  ) {
    if (!organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        organizationId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
