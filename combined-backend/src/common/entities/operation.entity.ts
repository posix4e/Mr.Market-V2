import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OperationStatus, OperationType } from '../enums/operation.enum';
import { Order } from './order.entity';
import { TradingStrategy } from './trading-strategy.entity';

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  strategyId: string;

  @Column({
    type: 'enum',
    enum: OperationType,
  })
  type: OperationType;

  @Column({
    type: 'enum',
    enum: OperationStatus,
    default: OperationStatus.PENDING,
  })
  status: OperationStatus;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.operation)
  orders: Order[];

  @ManyToOne(() => TradingStrategy, (strategy) => strategy.operations, { nullable: true })
  @JoinColumn({ name: 'strategyId' })
  strategy: TradingStrategy;
}