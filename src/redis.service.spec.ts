/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { RedisClientType } from 'redis';

describe('RedisService', () => {
    let service: RedisService;
    let redisClientMock: RedisClientType;

    beforeEach(async () => {
        redisClientMock = {
            connect: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            quit: jest.fn().mockResolvedValue(undefined),
            set: jest.fn().mockResolvedValue('OK'),
            get: jest.fn().mockResolvedValue('value'),
            del: jest.fn().mockResolvedValue(1),
        } as unknown as RedisClientType;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: 'REDIS',
                    useValue: redisClientMock,
                },
            ],
        }).compile();

        service = module.get<RedisService>(RedisService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to Redis and handle errors', async () => {
            redisClientMock.connect = jest.fn().mockReturnValueOnce(Promise.resolve());
            redisClientMock.on = jest.fn((event: string, handler: (...args: any[]) => void) => {
                if (event === 'error') {
                    handler(new Error('Redis connection error'));
                }
                return redisClientMock;
            });

            service.onModuleInit();

            expect(redisClientMock.connect).toHaveBeenCalled();
            expect(redisClientMock.on).toHaveBeenCalledWith('error', expect.any(Function));
        });

        it('should log error if connection fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            redisClientMock.connect = jest.fn().mockReturnValueOnce(Promise.reject(new Error('Connection failed')));

            await service.onModuleInit();

            expect(redisClientMock.connect).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Connection failed'));
        });
    });

    describe('onModuleDestroy', () => {
        it('should quit the Redis client', async () => {
            await service.onModuleDestroy();

            expect(redisClientMock.quit).toHaveBeenCalled();
        });
    });

    describe('set', () => {
        it('should set a value in Redis without TTL', async () => {
            await service.set('key', 'value');

            expect(redisClientMock.set).toHaveBeenCalledWith('key', 'value');
        });

        it('should set a value in Redis with TTL', async () => {
            await service.set('key', 'value', 3600);

            expect(redisClientMock.set).toHaveBeenCalledWith('key', 'value', { EX: 3600 });
        });

        it('should log error and throw if Redis set fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            redisClientMock.set = jest.fn().mockRejectedValue(new Error('Redis set failed'));

            await expect(service.set('key', 'value')).rejects.toThrow('Redis set failed');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting value in Redis:', new Error('Redis set failed'));
        });
    });

    describe('get', () => {
        it('should get a value from Redis', async () => {
            const result = await service.get('key');

            expect(result).toBe('value');
            expect(redisClientMock.get).toHaveBeenCalledWith('key');
        });

        it('should log error and throw if Redis get fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            redisClientMock.get = jest.fn().mockRejectedValue(new Error('Redis get failed'));

            await expect(service.get('key')).rejects.toThrow('Redis get failed');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting value from Redis:', new Error('Redis get failed'));
        });
    });

    describe('del', () => {
        it('should delete a key from Redis', async () => {
            await service.del('key');

            expect(redisClientMock.del).toHaveBeenCalledWith('key');
        });

        it('should log error and throw if Redis del fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            redisClientMock.del = jest.fn().mockRejectedValue(new Error('Redis del failed'));

            await expect(service.del('key')).rejects.toThrow('Redis del failed');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting key in Redis:', new Error('Redis del failed'));
        });
    });
});