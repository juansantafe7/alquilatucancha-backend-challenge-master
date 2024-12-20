<<<<<<< HEAD
=======
/* eslint-disable */
>>>>>>> upstream/main
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { ClubUpdatedHandler } from './domain/handlers/club-updated.handler';
import { GetAvailabilityHandler } from './domain/handlers/get-availability.handler';
import { ALQUILA_TU_CANCHA_CLIENT } from './domain/ports/aquila-tu-cancha.client';
import { HTTPAlquilaTuCanchaClient } from './infrastructure/clients/http-alquila-tu-cancha.client';
import { EventsController } from './infrastructure/controllers/events.controller';
import { SearchController } from './infrastructure/controllers/search.controller';
<<<<<<< HEAD
import { CacheService } from './services/cache.service';

@Module({
  imports: [HttpModule, CqrsModule, ConfigModule.forRoot()],
=======
import { RedisModule } from './redis.module'; // Importa el módulo de Redis

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    ConfigModule.forRoot(),
    RedisModule,
  ],
>>>>>>> upstream/main
  controllers: [SearchController, EventsController],
  providers: [
    {
      provide: ALQUILA_TU_CANCHA_CLIENT,
      useClass: HTTPAlquilaTuCanchaClient,
    },
    GetAvailabilityHandler,
    ClubUpdatedHandler,
<<<<<<< HEAD
    CacheService,
  ],exports: [CacheService],
})
export class AppModule {}
=======
  ],
})
export class AppModule { }
>>>>>>> upstream/main
