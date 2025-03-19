import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.checkHealth();
  }

  @Get('latest')
  async getLatestHealthCheck() {
    return this.healthService.getLatestHealthCheck();
  }

  @Get('history')
  async getHealthHistory(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.healthService.getHealthHistory(limit);
  }
}