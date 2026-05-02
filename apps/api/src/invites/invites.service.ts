import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

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

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.organizationInvite.upsert({
      where: {
        organizationId_email: {
          organizationId: actor.organizationId,
          email: dto.email,
        },
      },
      update: {
        role: dto.role ?? UserRole.MEMBER,
        token,
        acceptedAt: null,
        expiresAt,
        invitedById: actor.id,
      },
      create: {
        organizationId: actor.organizationId,
        email: dto.email,
        role: dto.role ?? UserRole.MEMBER,
        token,
        expiresAt,
        invitedById: actor.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        token: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });
  }

  async acceptInvite(token: string, dto: AcceptInviteDto) {
    const invite = await this.prisma.organizationInvite.findUnique({
      where: {
        token,
      },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: invite.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
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
          acceptedAt: new Date(),
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
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });
  }
}
