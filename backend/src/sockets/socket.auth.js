const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const { initRedisSubscribers } = require('./redis.subscriber');
const initWalletSubscriber = require('../modules/wallet/wallet.subscriber');

exports.initSocket = async (server) => {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const payload = jwt.verify(token, JWT_SECRET);

        console.log('JWT payload:', payload);

      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log("connected --- (socetfolde" , socket.userId);
     socket.join(socket.userId);
    console.log(`Socket connected: ${socket.userId}`);
  });

  // 🔥 Redis → Socket bridge
  await initRedisSubscribers(io);
  // await initWalletSubscriber(io);
};
