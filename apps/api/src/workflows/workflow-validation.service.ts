import { BadRequestException, Injectable } from '@nestjs/common';

type WorkflowStatusInput = {
  name: string;
  key: string;
  order: number;
  category: string;
  isStart?: boolean;
  isTerminal?: boolean;
};

@Injectable()
export class WorkflowValidationService {
  validateStatuses(statuses: WorkflowStatusInput[]) {
    if (!statuses.length) {
      throw new BadRequestException('Workflow must have at least one status');
    }

    this.validateSingleStart(statuses);
    this.validateTerminalExists(statuses);
    this.validateOrder(statuses);
    this.validateCategories(statuses);
  }

  private validateSingleStart(statuses: WorkflowStatusInput[]) {
    const startCount = statuses.filter((s) => s.isStart).length;

    if (startCount !== 1) {
      throw new BadRequestException(
        `Workflow must have exactly one start status. Found ${startCount}.`,
      );
    }
  }

  private validateTerminalExists(statuses: WorkflowStatusInput[]) {
    const terminalCount = statuses.filter((s) => s.isTerminal).length;

    if (terminalCount === 0) {
      throw new BadRequestException(
        'Workflow must have at least one terminal status.',
      );
    }
  }

  private validateOrder(statuses: WorkflowStatusInput[]) {
    const orders = statuses.map((s) => s.order);

    const uniqueOrders = new Set(orders);

    if (uniqueOrders.size !== orders.length) {
      throw new BadRequestException(
        'Workflow status order values must be unique.',
      );
    }

    const sorted = [...orders].sort((a, b) => a - b);

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        throw new BadRequestException(
          'Workflow status order must be sequential starting from 1.',
        );
      }
    }
  }

  private validateCategories(statuses: WorkflowStatusInput[]) {
    const allowed = ['TODO', 'ACTIVE', 'REVIEW', 'QA', 'DONE', 'CANCELED'];

    for (const status of statuses) {
      if (!allowed.includes(status.category)) {
        throw new BadRequestException(
          `Invalid category "${status.category}" for status "${status.name}"`,
        );
      }
    }
  }
}
