import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // TTL de 5 minutos
  }

  invalidateCache(key: string): void {
    console.log(`Invalidating cache for key: ${key}`);
    this.cache.del(key);
  }

  getCacheInstance(): NodeCache {
    return this.cache;
  }
}
