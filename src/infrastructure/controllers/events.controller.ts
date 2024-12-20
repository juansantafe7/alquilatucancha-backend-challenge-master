<<<<<<< HEAD
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { UseZodGuard } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
import { Response } from 'express';
import { Readable } from 'stream';
=======
/* eslint-disable */
import { Body, Controller, Post, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { UseZodGuard } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';
>>>>>>> upstream/main

import { ClubUpdatedEvent } from '../../domain/events/club-updated.event';
import { CourtUpdatedEvent } from '../../domain/events/court-updated.event';
import { SlotBookedEvent } from '../../domain/events/slot-booked.event';
import { SlotAvailableEvent } from '../../domain/events/slot-cancelled.event';
<<<<<<< HEAD
import { CacheService } from '../../services/cache.service';
=======
>>>>>>> upstream/main

const SlotSchema = z.object({
  price: z.number(),
  duration: z.number(),
  datetime: z.string(),
  start: z.string(),
  end: z.string(),
  _priority: z.number(),
});

export const ExternalEventSchema = z.union([
  z.object({
    type: z.enum(['booking_cancelled', 'booking_created']),
    clubId: z.number().int(),
    courtId: z.number().int(),
    slot: SlotSchema,
  }),
  z.object({
    type: z.literal('club_updated'),
    clubId: z.number().int(),
    fields: z.array(
      z.enum(['attributes', 'openhours', 'logo_url', 'background_url']),
    ),
  }),
  z.object({
    type: z.literal('court_updated'),
    clubId: z.number().int(),
    courtId: z.number().int(),
    fields: z.array(z.enum(['attributes', 'name'])),
  }),
]);

export type ExternalEventDTO = z.infer<typeof ExternalEventSchema>;

@Controller('events')
export class EventsController {
<<<<<<< HEAD
  constructor(
    private eventBus: EventBus,
    private cacheService: CacheService,
  ) {}
=======
  private readonly logger = new Logger(EventsController.name);

  constructor(private eventBus: EventBus) { }
>>>>>>> upstream/main

  @Post()
  @UseZodGuard('body', ExternalEventSchema)
  async receiveEvent(@Body() externalEvent: ExternalEventDTO) {
<<<<<<< HEAD
    let cacheKey: string | null = null;

    switch (externalEvent.type) {
      case 'booking_created':
        this.eventBus.publish(
          new SlotBookedEvent(
            externalEvent.clubId,
            externalEvent.courtId,
            externalEvent.slot,
          ),
        );
        cacheKey = `slots-${externalEvent.clubId}-${externalEvent.courtId}-${externalEvent.slot.datetime}`;
        break;

      case 'booking_cancelled':
        this.eventBus.publish(
          new SlotAvailableEvent(
            externalEvent.clubId,
            externalEvent.courtId,
            externalEvent.slot,
          ),
        );
        cacheKey = `slots-${externalEvent.clubId}-${externalEvent.courtId}-${externalEvent.slot.datetime}`;
        break;

      case 'club_updated':
        this.eventBus.publish(
          new ClubUpdatedEvent(externalEvent.clubId, externalEvent.fields),
        );

        // Solo invalidar si los campos afectados no son irrelevantes
        if (externalEvent.fields.includes('attributes') || externalEvent.fields.includes('logo_url')) {
          cacheKey = `clubs-${externalEvent.clubId}`;
        }
        break;

      case 'court_updated':
        this.eventBus.publish(
          new CourtUpdatedEvent(
            externalEvent.clubId,
            externalEvent.courtId,
            externalEvent.fields,
          ),
        );

        // Solo invalidar si los campos relevantes cambian
        if (externalEvent.fields.includes('attributes') || externalEvent.fields.includes('name')) {
          cacheKey = `courts-${externalEvent.courtId}`;
        }
        break;
    }

    // Invalidar el cache si se generó un cacheKey
    if (cacheKey) {
      console.log(`Invalidating cache for key: ${cacheKey}`);
      this.cacheService.invalidateCache(cacheKey);
    }
  }

  @Get('large-data')
async streamEvents(@Res() res: Response) {
  try {
    const events = [
      { id: 1, type: 'booking_created', clubId: 101, courtId: 201 },
      { id: 2, type: 'booking_cancelled', clubId: 102, courtId: 202 },
      { id: 3, type: 'club_updated', clubId: 103, fields: ['logo_url'] },
    ];

    const stream = new Readable({
      objectMode: true,
      read() {},
    });

    for (const event of events) {
      stream.push(JSON.stringify(event) + '\n');
    }
    stream.push(null);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    stream.pipe(res);
  } catch (error) {
    console.error('Error while streaming data:', error);
    res.status(500).send({ error: 'Failed to stream data' });
  }
}

=======
    this.logger.log(`Received event: ${externalEvent.type}`);

    try {
      switch (externalEvent.type) {
        case 'booking_created':
          this.eventBus.publish(
            new SlotBookedEvent(
              externalEvent.clubId,
              externalEvent.courtId,
              externalEvent.slot,
            ),
          );
          this.logger.log(`Processed booking_created event for clubId: ${externalEvent.clubId}, courtId: ${externalEvent.courtId}`);
          break;
        case 'booking_cancelled':
          this.eventBus.publish(
            new SlotAvailableEvent(
              externalEvent.clubId,
              externalEvent.courtId,
              externalEvent.slot,
            ),
          );
          this.logger.log(`Processed booking_cancelled event for clubId: ${externalEvent.clubId}, courtId: ${externalEvent.courtId}`);
          break;
        case 'club_updated':
          this.eventBus.publish(
            new ClubUpdatedEvent(externalEvent.clubId, externalEvent.fields),
          );
          this.logger.log(`Processed club_updated event for clubId: ${externalEvent.clubId}`);
          break;
        case 'court_updated':
          this.eventBus.publish(
            new CourtUpdatedEvent(
              externalEvent.clubId,
              externalEvent.courtId,
              externalEvent.fields,
            ),
          );
          this.logger.log(`Processed court_updated event for clubId: ${externalEvent.clubId}, courtId: ${externalEvent.courtId}`);
          break;
        default:
          this.logger.warn(`Unknown event type received: ${(externalEvent as any).type}`);
          return { status: 'error', message: `Unknown event type: ${(externalEvent as any).type}` };
      }

      return { status: 'success', message: 'Event processed successfully' };
    } catch (error: any) {
      this.logger.error(`Error processing event: ${externalEvent.type}`, error.stack || error);
      return { status: 'error', message: 'Failed to process event' };
    }
  }
>>>>>>> upstream/main
}
