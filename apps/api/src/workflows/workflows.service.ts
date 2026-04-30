import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findDefaultWorkflow() {
    const workflow = await this.prisma.workflow.findUnique({
      where: {
        id: 'default_workflow',
      },
      include: {
        statuses: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Default workflow not found');
    }

    return workflow;
  }

  async findWorkflowById(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        statuses: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with id ${id} not found`);
    }

    return workflow;
  }
}
