export enum OperationType {
  MARKET_MAKING = 'market_making',
  ARBITRAGE = 'arbitrage',
  MANUAL_TRADE = 'manual_trade',
  VOLUME_CONTRIBUTION = 'volume_contribution',
}

export enum OperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}