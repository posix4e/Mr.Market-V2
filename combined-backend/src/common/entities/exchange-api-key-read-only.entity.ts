import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exchange } from '../enums/exchange.enum';

@Entity('exchange_api_keys_read_only')
export class ExchangeApiKeyReadOnly {
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}