import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { WorkflowValidationService } from './workflow-validation.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: WorkflowValidationService,
  ) {}

  async validateWorkflowDefinition(statuses: any[]) {
    this.validator.validateStatuses(statuses);
  }

  async findDefaultWorkflow(organizationId: string | null) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        organizationId,
      },
      include: {
        statuses: {
          orderBy: {
            order: 'asc',
          },
        },
        transitions: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException('Default workflow not found');
    }

    this.validator.validateStatuses(workflow.statuses);

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
        transitions: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with id ${id} not found`);
    }

    return workflow;
  }
}
