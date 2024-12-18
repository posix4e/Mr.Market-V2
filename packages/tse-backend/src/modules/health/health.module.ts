import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ConfigService } from '@nestjs/config';
import { ExchangesHealthService } from './exchanges.health.service';
import { DbHealthService } from './db.health.service';
import { TradingStrategyModule } from '../trading-strategy/trading-strategy.module';
import { StrategiesHealthService } from './strategies.health.service';

@Module({
  imports: [IntegrationsModule, TradingStrategyModule],
  providers: [
    ConfigService,
    HealthService,
    ExchangesHealthService,
    DbHealthService,
    StrategiesHealthService,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
