const { createClient } = require('redis');
const { REDIS_URL } = require('./env');

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

// 🔹 Command + publish client
const redisClient = createClient({ url: REDIS_URL });
redisClient.connect().then(() => {
  console.log('✅ Redis connected');
});

// 🔹 Dedicated subscriber client
const redisSubscriber = createClient({ url: REDIS_URL });
redisSubscriber.connect().then(() => {
  console.log('✅ Redis subscriber connected');
});

module.exports = {
  redisClient,
  redisSubscriber,
};
