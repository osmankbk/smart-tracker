import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyOrganizationMembers(actor: {
    role: string;
    organizationId: string | null;
  }) {
    if (!actor.organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only admins and managers can view members');
    }

    return this.prisma.user.findMany({
      where: {
        organizationId: actor.organizationId,
      },
      orderBy: [
        {
          role: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
