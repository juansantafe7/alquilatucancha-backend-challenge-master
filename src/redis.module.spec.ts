/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

jest.mock('redis', () => ({
    createClient: jest.fn().mockReturnValue({
        connect: jest.fn(),
        on: jest.fn(),
        quit: jest.fn(),
    }),
}));

describe('RedisModule', () => {
    let redisService: RedisService;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [RedisModule],
        }).compile();

        redisService = module.get<RedisService>(RedisService);
    });

    it('should provide RedisService', () => {
        expect(redisService).toBeDefined();
    });

    it('should create a Redis client', () => {
        const redisClient = module.get('REDIS');
        expect(redisClient).toBeDefined();
        expect(createClient).toHaveBeenCalledWith({
            url: 'redis://redis:6379',
        });
    });

    afterAll(async () => {
        await module.close();
    });
});