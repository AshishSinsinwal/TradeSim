const {redisSubscriber} = require('../config/redis');

exports.initRedisSubscribers =  async (io) => {
   console.log('🔥 initRedisSubscribers called');
  
await redisSubscriber.subscribe('wallet_updated', (message) => {
    const data = JSON.parse(message);
    const { userId, balance, locked } = data;
    
    const roomSize = io.sockets.adapter.rooms.get(userId)?.size || 0;
    console.log(`Sending update to User: ${userId}. Active connections in room: ${roomSize}`);

    io.to(userId).emit('wallet_updated', { balance, locked });
});

  await redisSubscriber.subscribe('orders', (message) => {
    const { userId, order } = JSON.parse(message);
    io.to(userId).emit('order_updated', order);
  });

  await redisSubscriber.subscribe('trades', (message) => {
    io.emit('trade_executed', JSON.parse(message));
  });
};
