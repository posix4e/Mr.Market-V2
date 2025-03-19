import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { TypeOrmConfigService } from './common/config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { LoggerModule } from './modules/logger/logger.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { TradingStrategyModule } from './modules/trading-strategy/trading-strategy.module';
import { TradingHistoryModule } from './modules/trading-history/trading-history.module';
import { WebSchedulerModule } from './modules/web-scheduler/web-scheduler.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          password: configService.get<string>('REDIS_PASSWORD', ''),
          database: configService.get<number>('REDIS_DB', 0),
          ttl: 60 * 60 * 24, // 24 hours
        });
        
        return {
          store: () => store,
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    AuthModule,
    UserModule,
    HealthModule,
    TransactionModule,
    ExchangeModule,
    TradingStrategyModule,
    TradingHistoryModule,
    WebSchedulerModule,
    IntegrationsModule,
  ],
})
export class AppModule {}