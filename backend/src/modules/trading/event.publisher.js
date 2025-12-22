const { redisClient } = require('../../config/redis');

exports.publishTrade = async (trade) => {
  await redisClient.publish(
    'trades',
    JSON.stringify(trade)
  );
};

exports.publishOrderUpdate = async (userId, order) => {
  await redisClient.publish(
    'orders',
    JSON.stringify({
      userId: userId,
      order: order,  
    })
  );
};

exports.publishWalletUpdate = async (userId, wallet) => {
 console.log('PUBLISH WALLET UPDATE:', userId, wallet);
  await redisClient.publish(
    'wallet_updated',
    JSON.stringify({
      userId,
      balance: wallet.balance,
      locked: wallet.locked,
    })
  );
};
