import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { NotificationsService } from '../notifications/notifications.service';

import { ORDER_ACTIVITY_ACTIONS } from 'src/orders/constants/order-activity-actions';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  private extractMentionTokens(body: string) {
    const matches = body.match(/@[\w.-]+/g) ?? [];

    return [
      ...new Set(matches.map((match: string) => match.slice(1).toLowerCase())),
    ];
  }

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
    const mentionTokens = this.extractMentionTokens(dto.body);

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

      if (mentionTokens.length > 0) {
        const mentionedUsers = await tx.user.findMany({
          where: {
            organizationId,
            OR: mentionTokens.map((token) => ({
              email: {
                startsWith: token,
                mode: 'insensitive',
              },
            })),
          },
        });

        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id === authorId) {
            continue;
          }

          await tx.notification.create({
            data: {
              organizationId,
              userId: mentionedUser.id,
              actorId: authorId,
              orderId,
              commentId: comment.id,
              type: 'MENTION',
              title: `${comment.author.name || comment.author.email} mentioned you`,
              body: `You were mentioned on "${order.title}".`,
            },
          });
        }
      }

      return comment;
    });
  }
}
