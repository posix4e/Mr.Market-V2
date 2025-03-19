import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions, LoggerOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserBalance } from '../entities/user-balance.entity';
import { MixinDeposit } from '../entities/mixin-deposit.entity';
import { MixinWithdrawal } from '../entities/mixin-withdrawal.entity';
import { ExchangeDeposit } from '../entities/exchange-deposit.entity';
import { ExchangeWithdrawal } from '../entities/exchange-withdrawal.entity';
import { MixinAuthSession } from '../entities/mixin-auth-session.entity';
import { ExchangeApiKey } from '../entities/exchange-api-key.entity';
import { ExchangeApiKeyReadOnly } from '../entities/exchange-api-key-read-only.entity';
import { Order } from '../entities/order.entity';
import { Operation } from '../entities/operation.entity';
import { TradingStrategy } from '../entities/trading-strategy.entity';
import { TradingHistory } from '../entities/trading-history.entity';
import { Web3IdentityKey } from '../entities/web3-identity-key.entity';
import { Web3IdentityRpc } from '../entities/web3-identity-rpc.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.getTypeOrmConfig();
  }

  getTypeOrmConfig(): TypeOrmModuleOptions {
    const logging: LoggerOptions = this.configService.get<string>('DATABASE_LOGGING_LEVEL')
      ? (this.configService.get<string>('DATABASE_LOGGING_LEVEL').split(',') as LoggerOptions)
      : false;

    return {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: this.configService.get<number>('POSTGRES_PORT', 5432),
      username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      database: this.configService.get<string>('POSTGRES_DB', 'mrmarket_combined'),
      entities: [
        User,
        UserBalance,
        MixinDeposit,
        MixinWithdrawal,
        ExchangeDeposit,
        ExchangeWithdrawal,
        MixinAuthSession,
        ExchangeApiKey,
        ExchangeApiKeyReadOnly,
        Order,
        Operation,
        TradingStrategy,
        TradingHistory,
        Web3IdentityKey,
        Web3IdentityRpc,
      ],
      migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
      logging,
      synchronize: this.configService.get<boolean>('DATABASE_SYNCHRONIZE', false),
      migrationsRun: this.configService.get<boolean>('DATABASE_AUTO_RUN_MIGRATIONS', true),
      ssl: this.configService.get<boolean>('DATABASE_SSL', false),
    };
  }
}

// For migrations
export const dataSourceOptions: DataSourceOptions = new TypeOrmConfigService(
  new ConfigService(),
).getTypeOrmConfig() as DataSourceOptions;

export const dataSource = new DataSource(dataSourceOptions);