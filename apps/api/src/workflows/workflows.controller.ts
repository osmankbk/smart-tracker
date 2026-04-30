import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';

@Controller({
  path: 'workflows',
  version: '1',
})
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('default')
  findDefaultWorkflow() {
    return this.workflowsService.findDefaultWorkflow();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findWorkflowById(@Param('id') id: string) {
    return this.workflowsService.findWorkflowById(id);
  }
}
