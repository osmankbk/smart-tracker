import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
