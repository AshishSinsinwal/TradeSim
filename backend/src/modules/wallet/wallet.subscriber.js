const { redisSubscriber } = require('../../config/redis');

module.exports = function initWalletSubscriber(io) {
  redisSubscriber.subscribe('wallet_updated', (message) => {
    const data = JSON.parse(message);

    const { userId, balance, locked } = data;

    console.log('📡 Redis wallet update received:', data);

    io.to(userId).emit('wallet_updated', {
      balance,
      locked,
    });
  });
};
