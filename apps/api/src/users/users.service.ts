import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
