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
import { TransactionStatus } from '../enums/transaction.enum';

@Entity('mixin_deposits')
export class MixinDeposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  assetId: string;

  @Column()
  symbol: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column()
  snapshotId: string;

  @Column()
  opponentId: string;

  @Column({ nullable: true })
  memo: string;

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

  @ManyToOne(() => User, (user) => user.mixinDeposits)
  @JoinColumn({ name: 'userId' })
  user: User;
}