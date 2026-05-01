import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';
import * as currentUserDecorator from '../auth/decorators/current-user.decorator';

@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.ordersService.findAll(user.organizationId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.ordersService.findById(id, user.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.ordersService.create(
      createOrderDto,
      user.id,
      user.organizationId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.ordersService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
  ) {
    return this.ordersService.cancel(id, user.id);
  }
}
