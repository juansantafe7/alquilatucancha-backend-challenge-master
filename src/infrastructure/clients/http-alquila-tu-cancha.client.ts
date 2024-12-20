import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as NodeCache from 'node-cache';

import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';
import { AlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';

@Injectable()
export class HTTPAlquilaTuCanchaClient implements AlquilaTuCanchaClient {
  private base_url: string;
  private cache: NodeCache;

  constructor(private httpService: HttpService, config: ConfigService) {
    this.base_url = config.get<string>('ATC_BASE_URL', 'http://localhost:4000');
    this.cache = new NodeCache();
  }

  async prefetchDataFromJson(jsonData: any): Promise<void> {
    console.log('Starting pre-fetching data based on JSON...');
    const placeIds = new Set<string>();
    const dates = new Set<string>();

    jsonData.data.forEach((club: any) => {
      if (club.zone?.placeid) {
        placeIds.add(club.zone.placeid);
      }
      club.courts?.forEach((court: any) => {
        court.available?.forEach((slot: any) => {
          dates.add(moment(slot.datetime).format('YYYY-MM-DD'));
        });
      });
    });

    // Convertir Set a Array
    const placeIdArray = Array.from(placeIds);
    const dateArray = Array.from(dates);

    for (const placeId of placeIdArray) {
      // Obtener clubes por cada placeId
      const clubs = await this.getClubs(placeId);

      for (const club of clubs) {
        // Obtener canchas por cada club
        const courts = await this.getCourts(club.id);

        for (const court of courts) {
          for (const date of dateArray) {
            // Obtener slots disponibles para cada cancha y fecha
            await this.getAvailableSlots(club.id, court.id, new Date(date));
          }
        }
      }
    }

    console.log('Pre-fetching completed based on JSON data.');
  }

  async getClubs(placeId: string): Promise<Club[]> {
    const cacheKey = `clubs-${placeId}`;
    const cachedData = this.cache.get<Club[]>(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedData;
    }
    console.log(`Cache miss for key: ${cacheKey}`);
    const response = await this.httpService.axiosRef
      .get('clubs', {
        baseURL: this.base_url,
        params: { placeId },
      })
      .then((res) => res.data);

    this.cache.set(cacheKey, response, 86400); // TTL de 1 día
    return response;
  }

  async getCourts(clubId: number): Promise<Court[]> {
    const cacheKey = `courts-${clubId}`;
    const cachedData = this.cache.get<Court[]>(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedData;
    }

    console.log(`Cache miss for key: ${cacheKey}`);
    const response = await this.httpService.axiosRef
      .get(`/clubs/${clubId}/courts`, {
        baseURL: this.base_url,
      })
      .then((res) => res.data);

    this.cache.set(cacheKey, response, 86400); // TTL de 1 día
    return response;
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    const cacheKey = `slots-${clubId}-${courtId}-${moment(date).format('YYYY-MM-DD')}`;
    const cachedData = this.cache.get<Slot[]>(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedData;
    }

    console.log(`Cache miss for key: ${cacheKey}`);
    const response = await this.httpService.axiosRef
      .get(`/clubs/${clubId}/courts/${courtId}/slots`, {
        baseURL: this.base_url,
        params: { date: moment(date).format('YYYY-MM-DD') },
      })
      .then((res) => res.data);

    this.cache.set(cacheKey, response, 3600); // TTL de 1 hora
    return response;
  }
}
