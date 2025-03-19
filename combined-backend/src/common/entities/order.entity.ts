import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exchange } from '../enums/exchange.enum';
import { OrderSide, OrderType, OrderStatus } from '../enums/order.enum';
import { Operation } from './operation.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  operationId: string;

  @Column()
  userId: string;

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

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  type: OrderType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  price: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  filled: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  cost: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  fee: string;

  @Column({ nullable: true })
  feeCurrency: string;

  @Column({ nullable: true })
  exchangeOrderId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.OPEN,
  })
  status: OrderStatus;

  @Column({ nullable: true })
  lastTradeTimestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Operation, (operation) => operation.orders)
  @JoinColumn({ name: 'operationId' })
  operation: Operation;
}