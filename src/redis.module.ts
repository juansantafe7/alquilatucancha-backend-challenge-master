/* eslint-disable */
import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS',
            useValue: createClient({
                url: 'redis://redis:6379',
            }),
        },
        RedisService,
    ],
    exports: [RedisService],
})
export class RedisModule { }