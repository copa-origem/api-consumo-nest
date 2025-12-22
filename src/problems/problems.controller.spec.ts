import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateProblemDto } from './dto/create-problem.dto';

decribe('ProblemsController', () => {
    let controller: ProblemsController;
    let serviceMock: DeepMockProxy<ProblemsService>;

    beforEach(async () => {
        serviceMock = mockDeep<ProblemsService>();

        const module: TestingModule = await Test.CreateTestingModule({
            controllers: [ProblemsController],
            providers: [
                { provide: ProblemsService, useValue: serviceMock },
                { provide: PrismaService, useValue: mockDeep<PrismaService>() },
            ],
        }).compile();

        controller = module.get<ProblemsController>(ProblemsController);
    });
})