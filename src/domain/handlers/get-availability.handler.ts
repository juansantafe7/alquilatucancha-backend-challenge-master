<<<<<<< HEAD
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

=======
/* eslint-disable */
import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RedisService } from '../../redis.service';  // Asegúrate de que la ruta es correcta
>>>>>>> upstream/main
import {
  ClubWithAvailability,
  GetAvailabilityQuery,
} from '../commands/get-availaiblity.query';
import {
  ALQUILA_TU_CANCHA_CLIENT,
  AlquilaTuCanchaClient,
} from '../ports/aquila-tu-cancha.client';

@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler
<<<<<<< HEAD
  implements IQueryHandler<GetAvailabilityQuery>
{
  constructor(
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private alquilaTuCanchaClient: AlquilaTuCanchaClient,
  ) {}

  async execute(query: GetAvailabilityQuery): Promise<ClubWithAvailability[]> {
    // Paso 1: Obtener todos los clubes
    const clubs = await this.alquilaTuCanchaClient.getClubs(query.placeId);

    // Paso 2: Obtener las canchas y sus disponibilidades en paralelo
=======
  implements IQueryHandler<GetAvailabilityQuery> {
  private readonly logger = new Logger(GetAvailabilityHandler.name);

  constructor(
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private alquilaTuCanchaClient: AlquilaTuCanchaClient,
    private redisService: RedisService
  ) { }

  async execute(query: GetAvailabilityQuery): Promise<ClubWithAvailability[]> {
    this.logger.log(`Fetching availability for placeId: ${query.placeId} and date: ${query.date}`);


    const cacheKey = `availability:${query.placeId}:${query.date}`;

    const cachedResponse = await this.redisService.get(cacheKey);
    if (cachedResponse) {
      this.logger.log(`Cache hit for placeId: ${query.placeId} and date: ${query.date}`);
      return JSON.parse(cachedResponse);
    }

    const clubs = await this.alquilaTuCanchaClient.getClubs(query.placeId);

>>>>>>> upstream/main
    const clubs_with_availability = await Promise.all(
      clubs.map(async (club) => {
        const courts = await this.alquilaTuCanchaClient.getCourts(club.id);

        const courts_with_availability = await Promise.all(
          courts.map(async (court) => {
            const slots = await this.alquilaTuCanchaClient.getAvailableSlots(
              club.id,
              court.id,
              query.date,
            );
            return {
              ...court,
              available: slots,
            };
          }),
        );

        return {
          ...club,
          courts: courts_with_availability,
        };
      }),
    );

<<<<<<< HEAD
    return clubs_with_availability;
  }

}
=======

    await this.redisService.set(cacheKey, JSON.stringify(clubs_with_availability), 3600);

    this.logger.log(`Cache set for placeId: ${query.placeId} and date: ${query.date}`);

    return clubs_with_availability;
  }
}
>>>>>>> upstream/main
