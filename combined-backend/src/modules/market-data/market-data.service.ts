import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/utils/redis/redis.service';
import { Exchange } from '../../common/enums/exchange.enum';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly TICKER_KEY_PREFIX = 'market:ticker:';
  private readonly ORDERBOOK_KEY_PREFIX = 'market:orderbook:';
  private readonly OHLCV_KEY_PREFIX = 'market:ohlcv:';
  private readonly TICKER_CHANNEL = 'channel:ticker';
  private readonly ORDERBOOK_CHANNEL = 'channel:orderbook';
  private readonly OHLCV_CHANNEL = 'channel:ohlcv';

  constructor(private readonly redisService: RedisService) {}

  // Ticker methods
  async setTicker(exchange: Exchange, symbol: string, ticker: any): Promise<void> {
    const key = this.getTickerKey(exchange, symbol);
    await this.redisService.set(key, JSON.stringify(ticker));
    await this.redisService.publish(this.TICKER_CHANNEL, JSON.stringify({ exchange, symbol, ticker }));
  }

  async getTicker(exchange: Exchange, symbol: string): Promise<any | null> {
    const key = this.getTickerKey(exchange, symbol);
    const data = await this.redisService.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Orderbook methods
  async setOrderbook(exchange: Exchange, symbol: string, orderbook: any): Promise<void> {
    const key = this.getOrderbookKey(exchange, symbol);
    await this.redisService.set(key, JSON.stringify(orderbook));
    await this.redisService.publish(this.ORDERBOOK_CHANNEL, JSON.stringify({ exchange, symbol, orderbook }));
  }

  async getOrderbook(exchange: Exchange, symbol: string): Promise<any | null> {
    const key = this.getOrderbookKey(exchange, symbol);
    const data = await this.redisService.get(key);
    return data ? JSON.parse(data) : null;
  }

  // OHLCV methods
  async setOHLCV(exchange: Exchange, symbol: string, timeframe: string, ohlcv: any[]): Promise<void> {
    const key = this.getOHLCVKey(exchange, symbol, timeframe);
    await this.redisService.set(key, JSON.stringify(ohlcv));
    await this.redisService.publish(this.OHLCV_CHANNEL, JSON.stringify({ exchange, symbol, timeframe, ohlcv }));
  }

  async getOHLCV(exchange: Exchange, symbol: string, timeframe: string): Promise<any[] | null> {
    const key = this.getOHLCVKey(exchange, symbol, timeframe);
    const data = await this.redisService.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Subscription methods
  async subscribeToTickers(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.TICKER_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing ticker message: ${error.message}`);
      }
    });
  }

  async subscribeToOrderbooks(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.ORDERBOOK_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing orderbook message: ${error.message}`);
      }
    });
  }

  async subscribeToOHLCV(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.OHLCV_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing OHLCV message: ${error.message}`);
      }
    });
  }

  // Helper methods
  private getTickerKey(exchange: Exchange, symbol: string): string {
    return `${this.TICKER_KEY_PREFIX}${exchange}:${symbol}`;
  }

  private getOrderbookKey(exchange: Exchange, symbol: string): string {
    return `${this.ORDERBOOK_KEY_PREFIX}${exchange}:${symbol}`;
  }

  private getOHLCVKey(exchange: Exchange, symbol: string, timeframe: string): string {
    return `${this.OHLCV_KEY_PREFIX}${exchange}:${symbol}:${timeframe}`;
  }
}