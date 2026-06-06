const { createClient } = require('redis');
const { REDIS_URL } = require('./env');

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

// Helper to create a client with safe connect and error handling
function makeClient(name) {
  const client = createClient({ url: REDIS_URL });

  client.on('error', (err) => {
    console.error(`Redis ${name} error:`, err);
  });

  (async () => {
    try {
      await client.connect();
      console.log(`✅ Redis ${name} connected`);
    } catch (err) {
      console.error(`Failed to connect Redis ${name}:`, err.message || err);
      // Do not rethrow here — let the app decide how to proceed.
    }
  })();

  return client;
}

// 🔹 Command + publish client
const redisClient = makeClient('client');

// 🔹 Dedicated subscriber client
const redisSubscriber = makeClient('subscriber');

module.exports = {
  redisClient,
  redisSubscriber,
};
