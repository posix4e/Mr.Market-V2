import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { StrategyType } from '../enums/strategy-type.enum';
import { StrategyStatus } from '../enums/strategy-status.enum';
import { Operation } from './operation.entity';

@Entity('trading_strategies')
export class TradingStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: StrategyType,
  })
  type: StrategyType;

  @Column({
    type: 'enum',
    enum: StrategyStatus,
    default: StrategyStatus.INACTIVE,
  })
  status: StrategyStatus;

  @Column({ type: 'jsonb' })
  parameters: Record<string, any>;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  stoppedAt: Date;

  @Column({ default: false })
  isAutoRestart: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tradingStrategies)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Operation, (operation) => operation.strategy)
  operations: Operation[];
}