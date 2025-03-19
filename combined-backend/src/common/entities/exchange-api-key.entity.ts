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

@Entity('exchange_api_keys')
export class ExchangeApiKey {
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
  name: string;

  @Column()
  apiKey: string;

  @Column({ select: false })
  apiSecret: string;

  @Column({ nullable: true, select: false })
  passphrase: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  canTrade: boolean;

  @Column({ default: true })
  canDeposit: boolean;

  @Column({ default: true })
  canWithdraw: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.exchangeApiKeys)
  @JoinColumn({ name: 'userId' })
  user: User;
}