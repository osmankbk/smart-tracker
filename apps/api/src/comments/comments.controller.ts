import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import * as currentUserDecorator from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller({
  path: 'orders/:orderId/comments',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findForOrder(
    @Param('orderId') orderId: string,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.commentsService.findForOrder(orderId, user.organizationId);
  }

  @Post()
  createForOrder(
    @Param('orderId') orderId: string,
    @Body() dto: CreateCommentDto,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.commentsService.createForOrder(
      orderId,
      dto,
      user.id,
      user.organizationId,
    );
  }
}
