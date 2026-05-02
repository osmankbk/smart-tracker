import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const baseSlug = this.createSlug(registerDto.organizationName);

    if (!baseSlug) {
      throw new BadRequestException('Organization name is invalid');
    }

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: registerDto.organizationName,
          slug: `${baseSlug}-${Date.now()}`,
        },
      });

      const defaultWorkflow = await tx.workflow.create({
        data: {
          name: 'Default Workflow',
          organizationId: organization.id,
        },
      });

      const openStatus = await tx.workflowStatus.create({
        data: {
          workflowId: defaultWorkflow.id,
          name: 'Open',
          key: 'OPEN',
          order: 1,
          category: 'TODO',
          isStart: true,
          isTerminal: false,
        },
      });

      const inProgressStatus = await tx.workflowStatus.create({
        data: {
          workflowId: defaultWorkflow.id,
          name: 'In Progress',
          key: 'IN_PROGRESS',
          order: 2,
          category: 'ACTIVE',
          isStart: false,
          isTerminal: false,
        },
      });

      const doneStatus = await tx.workflowStatus.create({
        data: {
          workflowId: defaultWorkflow.id,
          name: 'Done',
          key: 'DONE',
          order: 3,
          category: 'DONE',
          isStart: false,
          isTerminal: true,
        },
      });

      const canceledStatus = await tx.workflowStatus.create({
        data: {
          workflowId: defaultWorkflow.id,
          name: 'Canceled',
          key: 'CANCELED',
          order: 4,
          category: 'CANCELED',
          isStart: false,
          isTerminal: true,
        },
      });

      await tx.workflowTransition.createMany({
        data: [
          {
            workflowId: defaultWorkflow.id,
            fromStatusId: openStatus.id,
            toStatusId: inProgressStatus.id,
          },
          {
            workflowId: defaultWorkflow.id,
            fromStatusId: inProgressStatus.id,
            toStatusId: doneStatus.id,
          },
          {
            workflowId: defaultWorkflow.id,
            fromStatusId: openStatus.id,
            toStatusId: canceledStatus.id,
          },
          {
            workflowId: defaultWorkflow.id,
            fromStatusId: inProgressStatus.id,
            toStatusId: canceledStatus.id,
          },
        ],
      });

      const user = await tx.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          passwordHash,
          role: UserRole.ADMIN,
          organizationId: organization.id,
        },
      });

      return this.buildAuthResponse(user);
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId: string | null;
  }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }
}
