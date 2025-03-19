import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../common/utils/redis/redis.service';
import { StrategyType } from '../../../common/enums/strategy-type.enum';
import { StrategyStatus } from '../../../common/enums/strategy-status.enum';
import { OperationStatus } from '../../../common/enums/operation.enum';

@Injectable()
export class StrategyExecutionService {
  private readonly logger = new Logger(StrategyExecutionService.name);
  private readonly STRATEGY_KEY_PREFIX = 'strategy:';
  private readonly OPERATION_KEY_PREFIX = 'operation:';
  private readonly STRATEGY_CHANNEL = 'channel:strategy';
  private readonly OPERATION_CHANNEL = 'channel:operation';

  constructor(private readonly redisService: RedisService) {}

  // Strategy execution methods
  async startStrategy(strategyId: string, type: StrategyType, parameters: Record<string, any>): Promise<void> {
    const key = this.getStrategyKey(strategyId);
    const strategyData = {
      id: strategyId,
      type,
      status: StrategyStatus.ACTIVE,
      parameters,
      startedAt: new Date().toISOString(),
    };
    
    await this.redisService.set(key, JSON.stringify(strategyData));
    await this.redisService.publish(this.STRATEGY_CHANNEL, JSON.stringify({
      action: 'start',
      strategy: strategyData,
    }));
    
    this.logger.log(`Strategy ${strategyId} started`);
  }

  async stopStrategy(strategyId: string): Promise<void> {
    const key = this.getStrategyKey(strategyId);
    const strategyDataStr = await this.redisService.get(key);
    
    if (!strategyDataStr) {
      this.logger.warn(`Strategy ${strategyId} not found`);
      return;
    }
    
    const strategyData = JSON.parse(strategyDataStr);
    strategyData.status = StrategyStatus.INACTIVE;
    strategyData.stoppedAt = new Date().toISOString();
    
    await this.redisService.set(key, JSON.stringify(strategyData));
    await this.redisService.publish(this.STRATEGY_CHANNEL, JSON.stringify({
      action: 'stop',
      strategy: strategyData,
    }));
    
    this.logger.log(`Strategy ${strategyId} stopped`);
  }

  async pauseStrategy(strategyId: string): Promise<void> {
    const key = this.getStrategyKey(strategyId);
    const strategyDataStr = await this.redisService.get(key);
    
    if (!strategyDataStr) {
      this.logger.warn(`Strategy ${strategyId} not found`);
      return;
    }
    
    const strategyData = JSON.parse(strategyDataStr);
    strategyData.status = StrategyStatus.PAUSED;
    
    await this.redisService.set(key, JSON.stringify(strategyData));
    await this.redisService.publish(this.STRATEGY_CHANNEL, JSON.stringify({
      action: 'pause',
      strategy: strategyData,
    }));
    
    this.logger.log(`Strategy ${strategyId} paused`);
  }

  async resumeStrategy(strategyId: string): Promise<void> {
    const key = this.getStrategyKey(strategyId);
    const strategyDataStr = await this.redisService.get(key);
    
    if (!strategyDataStr) {
      this.logger.warn(`Strategy ${strategyId} not found`);
      return;
    }
    
    const strategyData = JSON.parse(strategyDataStr);
    strategyData.status = StrategyStatus.ACTIVE;
    
    await this.redisService.set(key, JSON.stringify(strategyData));
    await this.redisService.publish(this.STRATEGY_CHANNEL, JSON.stringify({
      action: 'resume',
      strategy: strategyData,
    }));
    
    this.logger.log(`Strategy ${strategyId} resumed`);
  }

  async getStrategyStatus(strategyId: string): Promise<StrategyStatus | null> {
    const key = this.getStrategyKey(strategyId);
    const strategyDataStr = await this.redisService.get(key);
    
    if (!strategyDataStr) {
      return null;
    }
    
    const strategyData = JSON.parse(strategyDataStr);
    return strategyData.status;
  }

  // Operation methods
  async createOperation(operationId: string, strategyId: string | null, parameters: Record<string, any>): Promise<void> {
    const key = this.getOperationKey(operationId);
    const operationData = {
      id: operationId,
      strategyId,
      status: OperationStatus.PENDING,
      parameters,
      createdAt: new Date().toISOString(),
    };
    
    await this.redisService.set(key, JSON.stringify(operationData));
    await this.redisService.publish(this.OPERATION_CHANNEL, JSON.stringify({
      action: 'create',
      operation: operationData,
    }));
    
    this.logger.log(`Operation ${operationId} created`);
  }

  async startOperation(operationId: string): Promise<void> {
    const key = this.getOperationKey(operationId);
    const operationDataStr = await this.redisService.get(key);
    
    if (!operationDataStr) {
      this.logger.warn(`Operation ${operationId} not found`);
      return;
    }
    
    const operationData = JSON.parse(operationDataStr);
    operationData.status = OperationStatus.RUNNING;
    operationData.startedAt = new Date().toISOString();
    
    await this.redisService.set(key, JSON.stringify(operationData));
    await this.redisService.publish(this.OPERATION_CHANNEL, JSON.stringify({
      action: 'start',
      operation: operationData,
    }));
    
    this.logger.log(`Operation ${operationId} started`);
  }

  async completeOperation(operationId: string): Promise<void> {
    const key = this.getOperationKey(operationId);
    const operationDataStr = await this.redisService.get(key);
    
    if (!operationDataStr) {
      this.logger.warn(`Operation ${operationId} not found`);
      return;
    }
    
    const operationData = JSON.parse(operationDataStr);
    operationData.status = OperationStatus.COMPLETED;
    operationData.completedAt = new Date().toISOString();
    
    await this.redisService.set(key, JSON.stringify(operationData));
    await this.redisService.publish(this.OPERATION_CHANNEL, JSON.stringify({
      action: 'complete',
      operation: operationData,
    }));
    
    this.logger.log(`Operation ${operationId} completed`);
  }

  async failOperation(operationId: string, errorMessage: string): Promise<void> {
    const key = this.getOperationKey(operationId);
    const operationDataStr = await this.redisService.get(key);
    
    if (!operationDataStr) {
      this.logger.warn(`Operation ${operationId} not found`);
      return;
    }
    
    const operationData = JSON.parse(operationDataStr);
    operationData.status = OperationStatus.FAILED;
    operationData.failedAt = new Date().toISOString();
    operationData.errorMessage = errorMessage;
    
    await this.redisService.set(key, JSON.stringify(operationData));
    await this.redisService.publish(this.OPERATION_CHANNEL, JSON.stringify({
      action: 'fail',
      operation: operationData,
    }));
    
    this.logger.log(`Operation ${operationId} failed: ${errorMessage}`);
  }

  async cancelOperation(operationId: string): Promise<void> {
    const key = this.getOperationKey(operationId);
    const operationDataStr = await this.redisService.get(key);
    
    if (!operationDataStr) {
      this.logger.warn(`Operation ${operationId} not found`);
      return;
    }
    
    const operationData = JSON.parse(operationDataStr);
    operationData.status = OperationStatus.CANCELLED;
    
    await this.redisService.set(key, JSON.stringify(operationData));
    await this.redisService.publish(this.OPERATION_CHANNEL, JSON.stringify({
      action: 'cancel',
      operation: operationData,
    }));
    
    this.logger.log(`Operation ${operationId} cancelled`);
  }

  async getOperationStatus(operationId: string): Promise<OperationStatus | null> {
    const key = this.getOperationKey(operationId);
    const operationDataStr = await this.redisService.get(key);
    
    if (!operationDataStr) {
      return null;
    }
    
    const operationData = JSON.parse(operationDataStr);
    return operationData.status;
  }

  // Subscription methods
  async subscribeToStrategyEvents(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.STRATEGY_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing strategy message: ${error.message}`);
      }
    });
  }

  async subscribeToOperationEvents(callback: (data: any) => void): Promise<void> {
    await this.redisService.subscribe(this.OPERATION_CHANNEL, (channel, message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        this.logger.error(`Error parsing operation message: ${error.message}`);
      }
    });
  }

  // Helper methods
  private getStrategyKey(strategyId: string): string {
    return `${this.STRATEGY_KEY_PREFIX}${strategyId}`;
  }

  private getOperationKey(operationId: string): string {
    return `${this.OPERATION_KEY_PREFIX}${operationId}`;
  }
}