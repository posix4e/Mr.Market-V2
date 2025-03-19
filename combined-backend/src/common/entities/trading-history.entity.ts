import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exchange } from '../enums/exchange.enum';
import { OrderSide } from '../enums/order.enum';

@Entity('trading_histories')
export class TradingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  strategyId: string;

  @Column({ nullable: true })
  operationId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({
    type: 'enum',
    enum: Exchange,
  })
  exchange: Exchange;

  @Column()
  symbol: string;

  @Column({
    type: 'enum',
    enum: OrderSide,
  })
  side: OrderSide;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  price: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  cost: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  fee: string;

  @Column({ nullable: true })
  feeCurrency: string;

  @Column({ nullable: true })
  exchangeTradeId: string;

  @Column({ nullable: true })
  exchangeOrderId: string;

  @Column()
  tradeTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tradingHistories)
  @JoinColumn({ name: 'userId' })
  user: User;
}