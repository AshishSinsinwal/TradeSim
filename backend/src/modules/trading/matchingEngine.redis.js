const Trade = require('./trade.model');
const { OrderStatus } = require('./order.model');
const orderRepo = require('./order.repository');
const { redisClient } = require('../../config/redis');
const publisher = require('./event.publisher');
const {performance} = require('perf_hooks');

class RedisMatchingEngine {
  constructor(orderBook) {
    this.orderBook = orderBook;
  }

  async process(order) {
    const start = performance.now();

    const trades = [];

    await orderRepo.save(order); 

    if (order.side === 'BUY') {
      await this.matchBuy(order, trades);
    } else {
      await this.matchSell(order, trades);
    }

    if (order.remaining > 0 && order.type === 'LIMIT') {
      await this.orderBook.addOrder(order);
    }

    const end = performance.now();
    console.log(`[METRICS] Order processed in: ${(end - start).toFixed(3)} ms`);
    return trades;
  }

  async matchBuy(order, trades) {
    while (order.remaining > 0) {
      const bestSellId = await this.orderBook.bestSell();
      if (!bestSellId) break;

      const sell = await orderRepo.get(bestSellId);

      if (
        order.type === 'LIMIT' &&
        sell.price > order.price
      ) break;

      await this.executeTrade(order, sell, trades);
    }
  }

  async matchSell(order, trades) {
    while (order.remaining > 0) {
      const bestBuyId = await this.orderBook.bestBuy();
      if (!bestBuyId) break;

      const buy = await orderRepo.get(bestBuyId);

      if (
        order.type === 'LIMIT' &&
        buy.price < order.price
      ) break;

      await this.executeTrade(buy, order, trades);
    }
  }

  async executeTrade(buy, sell, trades) {
    const quantity = Math.min(buy.remaining, sell.remaining);

    let price;
    if (buy.type === 'MARKET') {
      price = sell.price;
    } else if (sell.type === 'MARKET') {
      price = buy.price;
    } else {
      price = sell.price;
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('MATCH_ENGINE_PRICE_ERROR');
    }

    buy.remaining -= quantity;
    sell.remaining -= quantity;

    const trade = new Trade({
      buyOrderId: buy.id,
      sellOrderId: sell.id,
      buyerId: buy.userId,
      sellerId: sell.userId,
      price,
      quantity,
    });

    trades.push(trade);

    await redisClient.lPush('recent_trades', JSON.stringify(trade));
    await redisClient.lTrim('recent_trades', 0, 49);

    this.updateStatus(buy);
    this.updateStatus(sell);

    await orderRepo.save(buy);
    await orderRepo.save(sell);


    await publisher.publishOrderUpdate(buy.userId, buy);
    await publisher.publishOrderUpdate(sell.userId, sell);

    if (buy.remaining === 0) {
      await this.orderBook.remove(buy.id);
    }
    if (sell.remaining === 0) {
      await this.orderBook.remove(sell.id);
    }
    
    console.log(`Matched: ${quantity} units at ${price}. Buyer: ${buy.userId}, Seller: ${sell.userId}`);
  }

  updateStatus(order) {
    if (order.remaining === 0) {
      order.status = OrderStatus.FILLED;
    } else if (order.remaining < order.quantity) {
      order.status = OrderStatus.PARTIAL;
    }
  }
}

module.exports = RedisMatchingEngine;