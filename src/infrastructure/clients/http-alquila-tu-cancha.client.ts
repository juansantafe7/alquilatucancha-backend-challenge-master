/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';
import { AlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';
import { RedisService } from '../../redis.service';

@Injectable()
export class HTTPAlquilaTuCanchaClient implements AlquilaTuCanchaClient {
  private base_url = '';
  private readonly logger = new Logger(HTTPAlquilaTuCanchaClient.name);

  constructor(
    private httpService: HttpService,
    config: ConfigService,
    private redisService: RedisService,
  ) {
    this.base_url = config.get<string>('ATC_BASE_URL', 'http://localhost:4000');
  }

  private async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    try {
      // Intenta obtener el valor desde Redis
      const cachedData = await this.redisService.get(key);
      if (cachedData) {
        this.logger.log(`Cache hit for key: ${key}`);
        return JSON.parse(cachedData);
      }

      this.logger.log(`Cache miss for key: ${key}. Fetching from API.`);
      const data = await fetchFn();

      // Almacena la respuesta en Redis
      await this.redisService.set(key, JSON.stringify(data), 3600);
      this.logger.log(`Data fetched and cached for key: ${key}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to fetch data for key: ${key}`, error.stack || error);
      throw error;
    }
  }

  async getClubs(placeId: string): Promise<Club[]> {
    const cacheKey = `clubs:${placeId}`;
    return this.getCachedOrFetch(cacheKey, () =>
      this.httpService.axiosRef
        .get('/clubs', {
          baseURL: this.base_url,
          params: { placeId },
        })
        .then((res) => res.data),
    );
  }

  async getCourts(clubId: number): Promise<Court[]> {
    const cacheKey = `courts:${clubId}`;
    return this.getCachedOrFetch(cacheKey, () =>
      this.httpService.axiosRef
        .get(`/clubs/${clubId}/courts`, {
          baseURL: this.base_url,
        })
        .then((res) => res.data),
    );
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    if (!clubId || !courtId || !date) {
      throw new Error('Missing required parameters');
    }

    const cacheKey = `slots:${clubId}:${courtId}:${moment(date).format('YYYY-MM-DD')}`;
    return this.getCachedOrFetch(cacheKey, () =>
      this.httpService.axiosRef
        .get(`/clubs/${clubId}/courts/${courtId}/slots`, {
          baseURL: this.base_url,
          params: { date: moment(date).format('YYYY-MM-DD') },
        })
        .then((res) => res.data),
    );
  }

  async getClubsWithCourtsAndSlots(
    placeId: string,
    date: Date,
  ): Promise<(Club & { courts: (Court & { available: Slot[] })[] })[]> {
    if (!placeId || !date) {
      throw new Error('Missing required parameters');
    }

    const cacheKey = `clubs_with_courts_and_slots:${placeId}:${moment(date).format('YYYY-MM-DD')}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const clubs = await this.getClubs(placeId);

      const clubsWithAvailability = await Promise.all(
        clubs.map(async (club) => {
          const courts = await this.getCourts(club.id);

          const courtsWithAvailability = await Promise.all(
            courts.map(async (court) => {
              const slots = await this.getAvailableSlots(club.id, court.id, date);
              return {
                ...court,
                available: slots,
              };
            }),
          );

          return {
            ...club,
            courts: courtsWithAvailability,
          };
        }),
      );

      return clubsWithAvailability;
    });
  }
}