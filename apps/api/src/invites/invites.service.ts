import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InviteStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createInvite(
    dto: CreateInviteDto,
    actor: {
      id: string;
      role: string;
      organizationId: string | null;
    },
  ) {
    if (!actor.organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can invite users');
    }

    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const existingPendingInvite =
      await this.prisma.organizationInvite.findFirst({
        where: {
          organizationId: actor.organizationId,
          email,
          status: InviteStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (existingPendingInvite) {
      throw new ConflictException(
        'A pending invite already exists for this email',
      );
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.organizationInvite.create({
      data: {
        organizationId: actor.organizationId,
        email,
        role: dto.role ?? UserRole.MEMBER,
        tokenHash,
        status: InviteStatus.PENDING,
        expiresAt,
        invitedById: actor.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });

    return {
      ...invite,
      token,
      inviteUrl: `/invite/${token}`,
    };
  }

  async previewInvite(token: string) {
    const tokenHash = this.hashToken(token);

    const invite = await this.prisma.organizationInvite.findUnique({
      where: {
        tokenHash,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite is no longer active');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return {
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      organization: invite.organization,
    };
  }
  async acceptInvite(token: string, dto: AcceptInviteDto) {
    const tokenHash = this.hashToken(token);

    const invite = await this.prisma.organizationInvite.findUnique({
      where: {
        tokenHash,
      },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite is no longer active');
    }

    if (invite.expiresAt < new Date()) {
      await this.prisma.organizationInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          status: InviteStatus.EXPIRED,
        },
      });

      throw new BadRequestException('Invite has expired');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: invite.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: invite.email,
          passwordHash,
          role: invite.role,
          organizationId: invite.organizationId,
        },
      });

      await tx.organizationInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          status: InviteStatus.ACCEPTED,
          acceptedAt: new Date(),
          acceptedById: user.id,
        },
      });

      return this.authService.buildAuthResponse(user);
    });
  }

  async findMyOrganizationInvites(actor: {
    role: string;
    organizationId: string | null;
  }) {
    if (!actor.organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view invites');
    }

    return this.prisma.organizationInvite.findMany({
      where: {
        organizationId: actor.organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
