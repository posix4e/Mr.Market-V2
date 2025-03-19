import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MarketDataService } from './market-data.service';
import { Exchange } from '../../common/enums/exchange.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'market-data',
})
export class MarketDataGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MarketDataGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly marketDataService: MarketDataService) {}

  afterInit() {
    this.logger.log('Market Data WebSocket Gateway initialized');
    
    // Subscribe to Redis channels
    this.marketDataService.subscribeToTickers((data) => {
      this.server.to(`ticker:${data.exchange}:${data.symbol}`).emit('ticker', data);
    });

    this.marketDataService.subscribeToOrderbooks((data) => {
      this.server.to(`orderbook:${data.exchange}:${data.symbol}`).emit('orderbook', data);
    });

    this.marketDataService.subscribeToOHLCV((data) => {
      this.server.to(`ohlcv:${data.exchange}:${data.symbol}:${data.timeframe}`).emit('ohlcv', data);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-ticker')
  handleSubscribeTicker(client: Socket, payload: { exchange: Exchange; symbol: string }) {
    const room = `ticker:${payload.exchange}:${payload.symbol}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribe-ticker', data: { success: true, room } };
  }

  @SubscribeMessage('unsubscribe-ticker')
  handleUnsubscribeTicker(client: Socket, payload: { exchange: Exchange; symbol: string }) {
    const room = `ticker:${payload.exchange}:${payload.symbol}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { event: 'unsubscribe-ticker', data: { success: true, room } };
  }

  @SubscribeMessage('subscribe-orderbook')
  handleSubscribeOrderbook(client: Socket, payload: { exchange: Exchange; symbol: string }) {
    const room = `orderbook:${payload.exchange}:${payload.symbol}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribe-orderbook', data: { success: true, room } };
  }

  @SubscribeMessage('unsubscribe-orderbook')
  handleUnsubscribeOrderbook(client: Socket, payload: { exchange: Exchange; symbol: string }) {
    const room = `orderbook:${payload.exchange}:${payload.symbol}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { event: 'unsubscribe-orderbook', data: { success: true, room } };
  }

  @SubscribeMessage('subscribe-ohlcv')
  handleSubscribeOHLCV(client: Socket, payload: { exchange: Exchange; symbol: string; timeframe: string }) {
    const room = `ohlcv:${payload.exchange}:${payload.symbol}:${payload.timeframe}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribe-ohlcv', data: { success: true, room } };
  }

  @SubscribeMessage('unsubscribe-ohlcv')
  handleUnsubscribeOHLCV(client: Socket, payload: { exchange: Exchange; symbol: string; timeframe: string }) {
    const room = `ohlcv:${payload.exchange}:${payload.symbol}:${payload.timeframe}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { event: 'unsubscribe-ohlcv', data: { success: true, room } };
  }
}