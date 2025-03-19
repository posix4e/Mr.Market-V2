import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { MarketDataGateway } from './market-data.gateway';
import { RedisModule } from '../../common/utils/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [MarketDataController],
  providers: [MarketDataService, MarketDataGateway],
  exports: [MarketDataService],
})
export class MarketDataModule {}