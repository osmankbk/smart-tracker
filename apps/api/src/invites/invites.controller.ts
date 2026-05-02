import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import * as currentUserDecorator from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InvitesService } from './invites.service';

@Controller({
  path: 'invites',
  version: '1',
})
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findMyOrganizationInvites(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.invitesService.findMyOrganizationInvites(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createInvite(
    @Body() dto: CreateInviteDto,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.invitesService.createInvite(dto, user);
  }

  @Get(':token')
  previewInvite(@Param('token') token: string) {
    return this.invitesService.previewInvite(token);
  }

  @Post(':token/accept')
  acceptInvite(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(token, dto);
  }
}
