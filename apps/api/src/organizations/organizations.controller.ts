import { Controller, Get, UseGuards } from '@nestjs/common';

import * as currentUserDecorator from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';

@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('members')
  findMyOrganizationMembers(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.organizationsService.findMyOrganizationMembers(user);
  }
}
