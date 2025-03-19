import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBalanceService } from './user-balance.service';
import { UserBalanceController } from './user-balance.controller';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { RedisModule } from '../../common/utils/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserBalance]),
    RedisModule,
  ],
  controllers: [UserBalanceController],
  providers: [UserBalanceService],
  exports: [UserBalanceService],
})
export class UserBalanceModule {}