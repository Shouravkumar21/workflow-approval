import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { RequestStatus, RequestType } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createRequestDto: CreateRequestDto) {
    return this.prisma.request.create({
      data: {
        ...createRequestDto,
        status: RequestStatus.PENDING,
      },
    });
  }

  async findAll(status?: RequestStatus, type?: RequestType) {
    return this.prisma.request.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, updateRequestStatusDto: UpdateRequestStatusDto) {
    const { status, role } = updateRequestStatusDto;

    if (role !== 'MANAGER') {
      throw new ForbiddenException('Only managers can approve or reject requests');
    }

    const request = await this.prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      throw new BadRequestException('Request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Status cannot be changed once it is approved or rejected');
    }

    return this.prisma.request.update({
      where: { id },
      data: { status },
    });
  }
}
