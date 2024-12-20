/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AppModule } from './app.module';
import { RedisModule } from './redis.module';
import { SearchController } from './infrastructure/controllers/search.controller';
import { EventsController } from './infrastructure/controllers/events.controller';
import { GetAvailabilityHandler } from './domain/handlers/get-availability.handler';
import { ClubUpdatedHandler } from './domain/handlers/club-updated.handler';
import { ALQUILA_TU_CANCHA_CLIENT } from './domain/ports/aquila-tu-cancha.client';
import { HTTPAlquilaTuCanchaClient } from './infrastructure/clients/http-alquila-tu-cancha.client';

describe('AppModule', () => {
    let appModule: TestingModule;

    beforeEach(async () => {
        appModule = await Test.createTestingModule({
            imports: [
                HttpModule,
                CqrsModule,
                ConfigModule.forRoot(),
                RedisModule,
                AppModule,
            ],
        }).compile();
    });

    it('should load the module without errors', () => {
        expect(appModule).toBeDefined();
    });

    it('should have SearchController defined', () => {
        const searchController = appModule.get<SearchController>(SearchController);
        expect(searchController).toBeDefined();
    });

    it('should have EventsController defined', () => {
        const eventsController = appModule.get<EventsController>(EventsController);
        expect(eventsController).toBeDefined();
    });

    it('should inject HTTPAlquilaTuCanchaClient for ALQUILA_TU_CANCHA_CLIENT', () => {
        const client = appModule.get(ALQUILA_TU_CANCHA_CLIENT);
        expect(client).toBeInstanceOf(HTTPAlquilaTuCanchaClient);
    });

    it('should have GetAvailabilityHandler defined', () => {
        const handler = appModule.get<GetAvailabilityHandler>(GetAvailabilityHandler);
        expect(handler).toBeDefined();
    });

    it('should have ClubUpdatedHandler defined', () => {
        const handler = appModule.get<ClubUpdatedHandler>(ClubUpdatedHandler);
        expect(handler).toBeDefined();
    });
});