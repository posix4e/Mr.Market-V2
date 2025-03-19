import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus } from '../enums/transaction.enum';
import { Exchange } from '../enums/exchange.enum';

@Entity('exchange_withdrawals')
export class ExchangeWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: Exchange,
  })
  exchange: Exchange;

  @Column()
  assetId: string;

  @Column()
  symbol: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ nullable: true })
  txId: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  tag: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}