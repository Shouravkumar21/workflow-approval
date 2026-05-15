import { Controller, Get, Post, Body, Patch, Param, Query, Put } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { RequestStatus, RequestType } from '@prisma/client';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  findAll(
    @Query('status') status?: RequestStatus,
    @Query('type') type?: RequestType,
  ) {
    return this.requestsService.findAll(status, type);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateRequestStatusDto: UpdateRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(id, updateRequestStatusDto);
  }
}
