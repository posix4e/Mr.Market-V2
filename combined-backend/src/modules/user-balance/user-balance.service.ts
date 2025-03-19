import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/utils/redis/redis.service';
import { UserBalance } from '../../common/entities/user-balance.entity';

@Injectable()
export class UserBalanceService {
  private readonly logger = new Logger(UserBalanceService.name);
  private readonly BALANCE_KEY_PREFIX = 'balance:';
  private readonly BALANCE_CHANNEL = 'channel:balance';

  constructor(
    @InjectRepository(UserBalance)
    private readonly userBalanceRepository: Repository<UserBalance>,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // Load all balances from database to Redis on startup
    await this.loadBalancesToRedis();
  }

  private async loadBalancesToRedis(): Promise<void> {
    const balances = await this.userBalanceRepository.find();
    
    for (const balance of balances) {
      const key = this.getBalanceKey(balance.userId, balance.assetId);
      await this.redisService.set(key, JSON.stringify({
        userId: balance.userId,
        assetId: balance.assetId,
        symbol: balance.symbol,
        balance: balance.balance,
        lockedBalance: balance.lockedBalance,
      }));
    }
    
    this.logger.log(`Loaded ${balances.length} balances to Redis`);
  }

  async getBalance(userId: string, assetId: string): Promise<UserBalance | null> {
    // Try to get from Redis first
    const key = this.getBalanceKey(userId, assetId);
    const balanceStr = await this.redisService.get(key);
    
    if (balanceStr) {
      const balanceData = JSON.parse(balanceStr);
      const balance = new UserBalance();
      balance.userId = balanceData.userId;
      balance.assetId = balanceData.assetId;
      balance.symbol = balanceData.symbol;
      balance.balance = balanceData.balance;
      balance.lockedBalance = balanceData.lockedBalance;
      return balance;
    }
    
    // If not in Redis, get from database
    const balance = await this.userBalanceRepository.findOne({
      where: { userId, assetId },
    });
    
    if (balance) {
      // Cache in Redis for future requests
      await this.redisService.set(key, JSON.stringify({
        userId: balance.userId,
        assetId: balance.assetId,
        symbol: balance.symbol,
        balance: balance.balance,
        lockedBalance: balance.lockedBalance,
      }));
    }
    
    return balance;
  }

  async getUserBalances(userId: string): Promise<UserBalance[]> {
    // Get from database
    const balances = await this.userBalanceRepository.find({
      where: { userId },
    });
    
    // Cache in Redis for future requests
    for (const balance of balances) {
      const key = this.getBalanceKey(balance.userId, balance.assetId);
      await this.redisService.set(key, JSON.stringify({
        userId: balance.userId,
        assetId: balance.assetId,
        symbol: balance.symbol,
        balance: balance.balance,
        lockedBalance: balance.lockedBalance,
      }));
    }
    
    return balances;
  }

  async updateBalance(userId: string, assetId: string, amount: string, isLocked: boolean = false): Promise<UserBalance> {
    // Start a database transaction
    const queryRunner = this.userBalanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Get current balance
      let balance = await queryRunner.manager.findOne(UserBalance, {
        where: { userId, assetId },
        lock: { mode: 'pessimistic_write' },
      });
      
      if (!balance) {
        // Create new balance if it doesn't exist
        balance = new UserBalance();
        balance.userId = userId;
        balance.assetId = assetId;
        balance.symbol = ''; // This should be set properly
        balance.balance = '0';
        balance.lockedBalance = '0';
      }
      
      // Update balance
      if (isLocked) {
        balance.lockedBalance = (parseFloat(balance.lockedBalance) + parseFloat(amount)).toString();
      } else {
        balance.balance = (parseFloat(balance.balance) + parseFloat(amount)).toString();
      }
      
      // Save to database
      const savedBalance = await queryRunner.manager.save(balance);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Update Redis
      const key = this.getBalanceKey(userId, assetId);
      await this.redisService.set(key, JSON.stringify({
        userId: savedBalance.userId,
        assetId: savedBalance.assetId,
        symbol: savedBalance.symbol,
        balance: savedBalance.balance,
        lockedBalance: savedBalance.lockedBalance,
      }));
      
      // Publish balance update
      await this.redisService.publish(this.BALANCE_CHANNEL, JSON.stringify({
        action: 'update',
        balance: {
          userId: savedBalance.userId,
          assetId: savedBalance.assetId,
          symbol: savedBalance.symbol,
          balance: savedBalance.balance,
          lockedBalance: savedBalance.lockedBalance,
        },
      }));
      
      return savedBalance;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error updating balance: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async lockBalance(userId: string, assetId: string, amount: string): Promise<UserBalance> {
    // Start a database transaction
    const queryRunner = this.userBalanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Get current balance
      const balance = await queryRunner.manager.findOne(UserBalance, {
        where: { userId, assetId },
        lock: { mode: 'pessimistic_write' },
      });
      
      if (!balance) {
        throw new Error(`User ${userId} does not have balance for asset ${assetId}`);
      }
      
      // Check if there's enough balance
      if (parseFloat(balance.balance) < parseFloat(amount)) {
        throw new Error(`Insufficient balance for asset ${assetId}`);
      }
      
      // Update balance
      balance.balance = (parseFloat(balance.balance) - parseFloat(amount)).toString();
      balance.lockedBalance = (parseFloat(balance.lockedBalance) + parseFloat(amount)).toString();
      
      // Save to database
      const savedBalance = await queryRunner.manager.save(balance);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Update Redis
      const key = this.getBalanceKey(userId, assetId);
      await this.redisService.set(key, JSON.stringify({
        userId: savedBalance.userId,
        assetId: savedBalance.assetId,
        symbol: savedBalance.symbol,
        balance: savedBalance.balance,
        lockedBalance: savedBalance.lockedBalance,
      }));
      
      // Publish balance update
      await this.redisService.publish(this.BALANCE_CHANNEL, JSON.stringify({
        action: 'lock',
        balance: {
          userId: savedBalance.userId,
          assetId: savedBalance.assetId,
          symbol: savedBalance.symbol,
          balance: savedBalance.balance,
          lockedBalance: savedBalance.lockedBalance,
        },
      }));
      
      return savedBalance;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error locking balance: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async unlockBalance(userId: string, assetId: string, amount: string): Promise<UserBalance> {
    // Start a database transaction
    const queryRunner = this.userBalanceRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Get current balance
      const balance = await queryRunner.manager.findOne(UserBalance, {
        where: { userId, assetId },
        lock: { mode: 'pessimistic_write' },
      });
      
      if (!balance) {
        throw new Error(`User ${userId} does not have balance for asset ${assetId}`);
      }
      
      // Check if there's enough locked balance
      if (parseFloat(balance.lockedBalance) < parseFloat(amount)) {
        throw new Error(`Insufficient locked balance for asset ${assetId}`);
      }
      
      // Update balance
      balance.balance = (parseFloat(balance.balance) + parseFloat(amount)).toString();
      balance.lockedBalance = (parseFloat(balance.lockedBalance) - parseFloat(amount)).toString();
      
      // Save to database
      const savedBalance = await queryRunner.manager.save(balance);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      // Update Redis
      const key = this.getBalanceKey(userId, assetId);
      await this.redisService.set(key, JSON.stringify({
        userId: savedBalance.userId,
        assetId: savedBalance.assetId,
        symbol: savedBalance.symbol,
        balance: savedBalance.balance,
        lockedBalance: savedBalance.lockedBalance,
      }));
      
      // Publish balance update
      await this.redisService.publish(this.BALANCE_CHANNEL, JSON.stringify({
        action: 'unlock',
        balance: {
          userId: savedBalance.userId,
          assetId: savedBalance.assetId,
          symbol: savedBalance.symbol,
          balance: savedBalance.balance,
          lockedBalance: savedBalance.lockedBalance,
        },
      }));
      
      return savedBalance;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error unlocking balance: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async subscribeToBalanceEvents(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.BALANCE_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing balance message: ${error.message}`);
      }
    });
  }

  private getBalanceKey(userId: string, assetId: string): string {
    return `${this.BALANCE_KEY_PREFIX}${userId}:${assetId}`;
  }
}