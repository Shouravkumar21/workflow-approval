import { Module } from '@nestjs/common';
import { RequestsController } from './requests/requests.controller';
import { RequestsService } from './requests/requests.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [RequestsController],
  providers: [RequestsService, PrismaService],
})
export class AppModule {}
