import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/utils/redis/redis.service';
import { HealthCheckService, HealthIndicatorResult, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly HEALTH_KEY_PREFIX = 'health:';
  private readonly HEALTH_CHANNEL = 'channel:health';
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly redisService: RedisService,
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  async onModuleInit() {
    // Start periodic health checks
    this.healthCheckInterval = setInterval(async () => {
      await this.checkHealth();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  async onModuleDestroy() {
    clearInterval(this.healthCheckInterval);
  }

  async checkHealth(): Promise<Record<string, any>> {
    try {
      // Check database health
      const dbHealth = await this.db.pingCheck('database');
      
      // Check Redis health
      const redisHealth = await this.checkRedisHealth();
      
      // Combine health results
      const healthResult = {
        timestamp: new Date().toISOString(),
        status: 'ok',
        database: dbHealth.database,
        redis: redisHealth,
      };
      
      // Store health check result in Redis
      await this.storeHealthCheck(healthResult);
      
      // Publish health check result
      await this.publishHealthCheck(healthResult);
      
      return healthResult;
    } catch (error) {
      const errorResult = {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message,
      };
      
      // Store error result in Redis
      await this.storeHealthCheck(errorResult);
      
      // Publish error result
      await this.publishHealthCheck(errorResult);
      
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      return errorResult;
    }
  }

  private async checkRedisHealth(): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redisService.ping();
      return {
        redis: {
          status: pong === 'PONG' ? 'up' : 'down',
        },
      };
    } catch (error) {
      return {
        redis: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  private async storeHealthCheck(healthResult: Record<string, any>): Promise<void> {
    const key = `${this.HEALTH_KEY_PREFIX}${Date.now()}`;
    await this.redisService.set(key, JSON.stringify(healthResult), 86400); // TTL: 24 hours
  }

  private async publishHealthCheck(healthResult: Record<string, any>): Promise<void> {
    await this.redisService.publish(this.HEALTH_CHANNEL, JSON.stringify(healthResult));
  }

  async getLatestHealthCheck(): Promise<Record<string, any> | null> {
    const keys = await this.redisService.keys(`${this.HEALTH_KEY_PREFIX}*`);
    
    if (keys.length === 0) {
      return null;
    }
    
    // Sort keys by timestamp (descending)
    keys.sort((a, b) => {
      const timestampA = parseInt(a.replace(this.HEALTH_KEY_PREFIX, ''));
      const timestampB = parseInt(b.replace(this.HEALTH_KEY_PREFIX, ''));
      return timestampB - timestampA;
    });
    
    // Get the latest health check
    const latestKey = keys[0];
    const healthCheckStr = await this.redisService.get(latestKey);
    
    return healthCheckStr ? JSON.parse(healthCheckStr) : null;
  }

  async getHealthHistory(limit: number = 10): Promise<Record<string, any>[]> {
    const keys = await this.redisService.keys(`${this.HEALTH_KEY_PREFIX}*`);
    
    if (keys.length === 0) {
      return [];
    }
    
    // Sort keys by timestamp (descending)
    keys.sort((a, b) => {
      const timestampA = parseInt(a.replace(this.HEALTH_KEY_PREFIX, ''));
      const timestampB = parseInt(b.replace(this.HEALTH_KEY_PREFIX, ''));
      return timestampB - timestampA;
    });
    
    // Get the latest health checks (limited by the limit parameter)
    const latestKeys = keys.slice(0, limit);
    const healthChecks: Record<string, any>[] = [];
    
    for (const key of latestKeys) {
      const healthCheckStr = await this.redisService.get(key);
      if (healthCheckStr) {
        healthChecks.push(JSON.parse(healthCheckStr));
      }
    }
    
    return healthChecks;
  }

  async subscribeToHealthEvents(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.HEALTH_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing health message: ${error.message}`);
      }
    });
  }
}