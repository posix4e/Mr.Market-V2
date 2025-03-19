import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserBalance } from './user-balance.entity';
import { MixinDeposit } from './mixin-deposit.entity';
import { MixinWithdrawal } from './mixin-withdrawal.entity';
import { ExchangeApiKey } from './exchange-api-key.entity';
import { TradingStrategy } from './trading-strategy.entity';
import { TradingHistory } from './trading-history.entity';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  mixinId: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserBalance, (userBalance) => userBalance.user)
  balances: UserBalance[];

  @OneToMany(() => MixinDeposit, (mixinDeposit) => mixinDeposit.user)
  mixinDeposits: MixinDeposit[];

  @OneToMany(() => MixinWithdrawal, (mixinWithdrawal) => mixinWithdrawal.user)
  mixinWithdrawals: MixinWithdrawal[];

  @OneToMany(() => ExchangeApiKey, (exchangeApiKey) => exchangeApiKey.user)
  exchangeApiKeys: ExchangeApiKey[];

  @OneToMany(() => TradingStrategy, (tradingStrategy) => tradingStrategy.user)
  tradingStrategies: TradingStrategy[];

  @OneToMany(() => TradingHistory, (tradingHistory) => tradingHistory.user)
  tradingHistories: TradingHistory[];
}