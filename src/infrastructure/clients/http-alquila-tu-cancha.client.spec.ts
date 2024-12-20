/* eslint-disable */
import { Test } from '@nestjs/testing';
import { HTTPAlquilaTuCanchaClient } from './http-alquila-tu-cancha.client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';

describe('HttpAlquilaTuCanchaClient', () => {
    let client: HTTPAlquilaTuCanchaClient;
    let httpService: HttpService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                HTTPAlquilaTuCanchaClient,
                {
                    provide: HttpService,
                    useValue: {
                        axiosRef: {
                            get: jest.fn(),
                        },
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('http://localhost:4000'),
                    },
                },
            ],
        }).compile();

        client = moduleRef.get<HTTPAlquilaTuCanchaClient>(HTTPAlquilaTuCanchaClient);
        httpService = moduleRef.get<HttpService>(HttpService);
    });

    describe('getClubs', () => {
        it('should return a list of clubs', async () => {
            const mockClubs: Club[] = [
                { id: 1, name: 'Club 1', location: 'Location 1', courts: [] },
                { id: 2, name: 'Club 2', location: 'Location 2', courts: [] }
            ];
            const response: AxiosResponse = {
                data: mockClubs,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };

            jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue(response);

            const result = await client.getClubs('somePlaceId');
            expect(result).toEqual(mockClubs);
            expect(httpService.axiosRef.get).toHaveBeenCalledWith('/clubs', {
                baseURL: 'http://localhost:4000',
                params: { placeId: 'somePlaceId' },
            });
        });

        it('should cache the result', async () => {
            const mockClubs: Club[] = [{ id: 1, name: 'Club 1', location: 'Location 1', courts: [] }];
            const response: AxiosResponse = {
                data: mockClubs,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };

            jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue(response);

            await client.getClubs('somePlaceId'); // Primera llamada
            await client.getClubs('somePlaceId'); // Segunda llamada, debería usar caché

            expect(httpService.axiosRef.get).toHaveBeenCalledTimes(1); // Solo debería llamarse una vez
        });
    });

    describe('getCourts', () => {
        it('should return a list of courts', async () => {
            const mockCourts: Court[] = [
                { id: 1, name: 'Court 1', available: [] }
            ];
            const response: AxiosResponse = {
                data: mockCourts,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };

            jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue(response);

            const result = await client.getCourts(1);
            expect(result).toEqual(mockCourts);
            expect(httpService.axiosRef.get).toHaveBeenCalledWith('/clubs/1/courts', {
                baseURL: 'http://localhost:4000',
            });
        });
    });

    describe('getAvailableSlots', () => {
        it('should return available slots', async () => {
            const mockSlots: Slot[] = [
                {
                    price: 100,
                    duration: 60,
                    datetime: '2024-08-17T10:00:00Z',
                    start: '10:00',
                    end: '11:00',
                    _priority: 1
                }
            ];
            const response: AxiosResponse = {
                data: mockSlots,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            };

            jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue(response);

            const result = await client.getAvailableSlots(1, 1, new Date());
            expect(result).toEqual(mockSlots);
            expect(httpService.axiosRef.get).toHaveBeenCalledWith('/clubs/1/courts/1/slots', expect.anything());
        });

        it('should throw an error if parameters are missing', async () => {
            await expect(client.getAvailableSlots(0, 1, new Date())).rejects.toThrow('Missing required parameters');
        });
    });

    describe('getClubsWithCourtsAndSlots', () => {
        it('should return clubs with courts and available slots', async () => {
            const mockClubs: Club[] = [
                { id: 1, name: 'Club 1', location: 'Location 1', courts: [] }
            ];
            const mockCourts: Court[] = [
                { id: 1, name: 'Court 1', available: [] }
            ];
            const mockSlots: Slot[] = [
                {
                    price: 100,
                    duration: 60,
                    datetime: '2024-08-17T10:00:00Z',
                    start: '10:00',
                    end: '11:00',
                    _priority: 1
                }
            ];

            jest.spyOn(client, 'getClubs').mockResolvedValue(mockClubs);
            jest.spyOn(client, 'getCourts').mockResolvedValue(mockCourts);
            jest.spyOn(client, 'getAvailableSlots').mockResolvedValue(mockSlots);

            const result = await client.getClubsWithCourtsAndSlots('placeId', new Date());

            expect(result).toEqual([{
                ...mockClubs[0],
                courts: [{
                    ...mockCourts[0],
                    available: mockSlots
                }]
            }]);
        });

        it('should throw an error if parameters are missing', async () => {
            await expect(client.getClubsWithCourtsAndSlots('', new Date())).rejects.toThrow('Missing required parameters');
        });
    });
});