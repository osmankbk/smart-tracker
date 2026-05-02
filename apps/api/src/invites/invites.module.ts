import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [AuthModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
