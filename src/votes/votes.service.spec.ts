import { Test, TestingModule } from '@nestjs/testing';
import { VotesService } from './votes.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { VoteType } from '@prisma/client';

describe('VotesService', () => {
    let service: VotesService;
    let prismaMock: DeepMockProxy<PrismaService>;

    beforeEach(async () => {
        prismaMock = mockDeep<PrismaService>();

        prismaMock.$transaction.mockImplementation(async (callback) => {
            return await callback(prismaMock);
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VotesService,
                { provide: PrismaService, useValue: prismaMock},
            ],
        }).compile();

        service = module.get<VotesService>(VotesService);
    });

    it('must delete the problem in three down votes reach', async () => {
        const userId = 'user-1';
        const problemId = 'prob-1';
        const dto = { problemId, type: VoteType.NON_EXISTENT };

        prismaMock.vote.findUnique.mockResolvedValue(null);

        prismaMock.vote.create.mockResolvedValue({ id: 'vote-1', ...dto, userId } as any);

        prismaMock.problem.update.mockResolvedValue({
            id: problemId,
            votesNotExistsCount: 3,
        } as any);

        await service.create(userId, dto);

        expect(prismaMock.problem.delete).toHaveBeenCalledWith({
            where: { id: problemId },
        });

        expect(prismaMock.problem.delete).toHaveBeenCalledTimes(1);
    });

    it('must NOT delete the problem if this problem have only 2 down votes', async () => {
        const userId = 'user-2';
        const problemId = 'prob-1';
        const dto = { problemId, type: VoteType.NON_EXISTENT };

        prismaMock.vote.findUnique.mockResolvedValue(null);
        prismaMock.vote.create.mockResolvedValue({ id: 'vote-2', ...dto, userId } as any);

        prismaMock.problem.update.mockResolvedValue({
            id: problemId,
            votesNotExistsCount: 2,
        } as any);

        await service.create(userId, dto);

        expect(prismaMock.problem.delete).not.toHaveBeenCalled();
    });
});