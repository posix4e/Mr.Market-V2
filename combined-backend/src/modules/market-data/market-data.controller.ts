import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { Exchange } from '../../common/enums/exchange.enum';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('ticker/:exchange/:symbol')
  async getTicker(
    @Param('exchange') exchange: Exchange,
    @Param('symbol') symbol: string,
  ) {
    return this.marketDataService.getTicker(exchange, symbol);
  }

  @Get('orderbook/:exchange/:symbol')
  async getOrderbook(
    @Param('exchange') exchange: Exchange,
    @Param('symbol') symbol: string,
  ) {
    return this.marketDataService.getOrderbook(exchange, symbol);
  }

  @Get('ohlcv/:exchange/:symbol')
  async getOHLCV(
    @Param('exchange') exchange: Exchange,
    @Param('symbol') symbol: string,
    @Query('timeframe') timeframe: string = '1h',
  ) {
    return this.marketDataService.getOHLCV(exchange, symbol, timeframe);
  }
}