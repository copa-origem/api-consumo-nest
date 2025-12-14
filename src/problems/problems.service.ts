import { Injectable } from '@nestjs/common';
import { CreateProblemDto } from './dto/create-problem.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, createProblemDto: CreateProblemDto) {
    return await this.prisma.problem.create({
      data: {
        description: createProblemDto.description,
        latitude: createProblemDto.latitude,
        longitude: createProblemDto.longitude,
        imageUrl: createProblemDto.imageUrl,

        issueType: {
          connect: { id: createProblemDto.issueTypeId }
        },
        author: {
          connect: { id: userId }
        }
      },
    });
  }

  findAll() {
    return `This action returns all problems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} problem`;
  }

  remove(id: number) {
    return `This action removes a #${id} problem`;
  }
}
