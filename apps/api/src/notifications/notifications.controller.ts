import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import * as currentUserDecorator from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller({
  path: 'notifications',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.notificationsService.findForUser(user.id, user.organizationId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.notificationsService.markAsRead(
      id,
      user.id,
      user.organizationId,
    );
  }
}
