/* eslint-disable */
import * as moment from 'moment';
import { GetAvailabilityHandler } from './get-availability.handler';
import { AlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';
import { RedisService } from '../../redis.service';
import { GetAvailabilityQuery } from '../commands/get-availaiblity.query';
import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';


describe('GetAvailabilityHandler', () => {
  let handler: GetAvailabilityHandler;
  let client: FakeAlquilaTuCanchaClient;
  let redisService: FakeRedisService;

  beforeEach(() => {
    client = new FakeAlquilaTuCanchaClient();
    redisService = new FakeRedisService();
    handler = new GetAvailabilityHandler(client, redisService);
  });

  it('returns the availability', async () => {
    client.clubs = {
      '123': [{ id: 1, name: 'Club 1', location: 'Location 1', courts: [] }],
    };
    client.courts = {
      '1': [{ id: 1, name: 'Court 1', available: [] }],
    };
    client.slots = {
      '1_1_2022-12-05': [],
    };
    const placeId = '123';
    const date = moment('2022-12-05').toDate();

    const response = await handler.execute(
      new GetAvailabilityQuery(placeId, date),
    );

    expect(response).toEqual([{ id: 1, name: 'Club 1', location: 'Location 1', courts: [{ id: 1, name: 'Court 1', available: [] }] }]);
  });
});

class FakeAlquilaTuCanchaClient implements AlquilaTuCanchaClient {
  clubs: Record<string, Club[]> = {};
  courts: Record<string, Court[]> = {};
  slots: Record<string, Slot[]> = {};

  async getClubs(placeId: string): Promise<Club[]> {
    return this.clubs[placeId];
  }

  async getCourts(clubId: number): Promise<Court[]> {
    return this.courts[String(clubId)];
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    return this.slots[
      `${clubId}_${courtId}_${moment(date).format('YYYY-MM-DD')}`
    ];
  }
}

class FakeRedisService {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}