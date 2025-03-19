# MrMarket Combined Backend

This is a combined backend for MrMarket and Trading Strategy Execution (TSE) services, optimized to use Redis for real-time data and PostgreSQL for persistent storage.

## Architecture

The combined backend follows a hexagonal architecture (ports and adapters) with clear separation of concerns:

- **Core Domain Logic**: Business rules and entities independent of external systems
- **Application Services**: Orchestration of use cases using domain entities
- **Adapters**: Integration with external systems (databases, APIs, etc.)
- **Infrastructure**: Technical concerns like configuration, logging, etc.

### Database Strategy

#### Redis Usage
- Real-time market data (order books, tickers, OHLCV)
- Session management
- Caching
- Pub/Sub for real-time updates
- Trading strategy execution state
- Health monitoring
- Rate limiting

#### PostgreSQL Usage
- User accounts and authentication
- Transaction history
- Trading strategies configuration
- Exchange API keys
- Long-term storage of trading performance

## Key Features

- **User Management**: Authentication, authorization, and user profiles
- **Exchange Integration**: Connect to multiple exchanges via CCXT
- **Trading Strategies**: Market making, arbitrage, and volume contribution
- **Transaction Handling**: Deposits and withdrawals for both Mixin and exchanges
- **Real-time Data**: WebSocket support for market data
- **Health Monitoring**: Comprehensive health checks
- **Fail-safe & Recovery**: Angel instance for monitoring and recovery

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure the environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run database migrations:
   ```bash
   npm run migration:run
   ```
5. Start the application:
   ```bash
   npm run start
   ```

### Using Docker

```bash
docker-compose up -d
```

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT