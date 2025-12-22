const { redisClient }  = require('../../config/redis');

const orderKey = (id) => `order:${id}`;

exports.save = async (order) => {
  await redisClient.hSet(orderKey(order.id), {
    id: order.id,
    userId: order.userId,
    side: order.side,
    type: order.type,
    price: order.price?.toString() || '0',
    quantity: order.quantity.toString(),
    remaining: order.remaining.toString(),
    status: order.status,
    timestamp: order.timestamp.toString(),
  });
};

exports.get = async (id) => {
  const data = await redisClient.hGetAll(orderKey(id));
  if (!data.id) return null;

  return {
    ...data,
    price: Number(data.price),
    quantity: Number(data.quantity),
    remaining: Number(data.remaining),
    timestamp: Number(data.timestamp),
  };
};

exports.getOpenOrdersByUser = async (userId, orderBook) => {

  const buyIds = await redisClient.zRange('orderbook:buy', 0, -1);
  const sellIds = await redisClient.zRange('orderbook:sell', 0, -1);
  const allIds = [...buyIds, ...sellIds];

  const orders = [];
  for (const id of allIds) {
    const order = await exports.get(id);
    if (order && order.userId === userId) {
      orders.push(order);
    }
  }
  return orders;
};

exports.getRecentTrades = async (limit = 50) => {
  const trades = await redisClient.lRange('recent_trades', 0, limit - 1);
  return trades.map(t => JSON.parse(t));
};
