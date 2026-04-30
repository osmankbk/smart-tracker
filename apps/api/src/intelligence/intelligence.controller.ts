import { Controller, Get, UseGuards } from '@nestjs/common';

import * as currentUserDecorator from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntelligenceService } from './intelligence.service';

@Controller({
  path: 'intelligence',
  version: '1',
})
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('brief')
  getBrief(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.intelligenceService.getDashboardBrief(user.id);
  }
}
