import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

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

    return clubs_with_availability;
  }

}
