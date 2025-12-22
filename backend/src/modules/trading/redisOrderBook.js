const {redisClient} = require('../../config/redis');

class RedisOrderBook {
  async addOrder(order) {
    const key = order.side === 'BUY'
      ? 'orderbook:buy'
      : 'orderbook:sell';

    const score =
      order.side === 'BUY'
        ? -order.price
        : order.price;

    await redisClient.zAdd(key, {
      score,
      value: order.id,
    });
  }

async remove(orderId, side) {
    await redisClient.zRem('orderbook:buy', orderId);
    await redisClient.zRem('orderbook:sell', orderId);
  }


async bestBuy() {
    const ids = await redisClient.zRange('orderbook:buy', 0, 0);
    return ids[0] || null;
  }

  async bestSell() {
    const ids = await redisClient.zRange('orderbook:sell', 0, 0);
    return ids[0] || null;
  }
}

module.exports = RedisOrderBook;
