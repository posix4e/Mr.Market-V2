import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      db: this.configService.get<number>('REDIS_DB', 0),
    };

    this.redisClient = new Redis(redisOptions);
    this.pubClient = new Redis(redisOptions);
    this.subClient = new Redis(redisOptions);

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.pubClient.on('error', (err) => {
      console.error('Redis Pub Client Error:', err);
    });

    this.subClient.on('error', (err) => {
      console.error('Redis Sub Client Error:', err);
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    await this.pubClient.quit();
    await this.subClient.quit();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getPubClient(): Redis {
    return this.pubClient;
  }

  getSubClient(): Redis {
    return this.subClient;
  }

  // Key-Value Operations
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redisClient.expire(key, seconds);
  }

  // Hash Operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisClient.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redisClient.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.redisClient.hdel(key, field);
  }

  async hmset(key: string, obj: Record<string, string>): Promise<'OK'> {
    return this.redisClient.hmset(key, obj);
  }

  // List Operations
  async lpush(key: string, value: string): Promise<number> {
    return this.redisClient.lpush(key, value);
  }

  async rpush(key: string, value: string): Promise<number> {
    return this.redisClient.rpush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    return this.redisClient.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.redisClient.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisClient.lrange(key, start, stop);
  }

  // Set Operations
  async sadd(key: string, member: string): Promise<number> {
    return this.redisClient.sadd(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  async srem(key: string, member: string): Promise<number> {
    return this.redisClient.srem(key, member);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.redisClient.sismember(key, member);
  }

  // Sorted Set Operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redisClient.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisClient.zrange(key, start, stop);
  }

  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    return this.redisClient.zrangebyscore(key, min, max);
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.redisClient.zrem(key, member);
  }

  // Pub/Sub Operations
  async publish(channel: string, message: string): Promise<number> {
    return this.pubClient.publish(channel, message);
  }

  async subscribe(channel: string, callback: (channel: string, message: string) => void): Promise<void> {
    await this.subClient.subscribe(channel);
    this.subClient.on('message', callback);
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subClient.unsubscribe(channel);
  }

  // Transaction Operations
  async multi(): Promise<Redis.Pipeline> {
    return this.redisClient.multi();
  }

  // Utility Methods
  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async flushdb(): Promise<'OK'> {
    return this.redisClient.flushdb();
  }

  async ping(): Promise<string> {
    return this.redisClient.ping();
  }
}