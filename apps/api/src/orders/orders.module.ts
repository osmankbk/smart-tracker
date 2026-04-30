import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { IntelligenceModule } from 'src/intelligence/intelligence.module';

@Module({
  imports: [IntelligenceModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
