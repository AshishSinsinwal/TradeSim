const RedisMatchingEngine = require('./matchingEngine.redis');
const RedisOrderBook = require('./redisOrderBook');
const TradingService = require('./trading.service');

const orderBook = new RedisOrderBook();
const matchingEngine = new RedisMatchingEngine(orderBook);
const tradingService = new TradingService(matchingEngine);

module.exports = tradingService;
