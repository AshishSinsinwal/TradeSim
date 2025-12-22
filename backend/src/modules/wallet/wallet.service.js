const { redisClient } = require('../../config/redis');
const publisher = require('../trading/event.publisher');

const walletKey = (userId) => `wallet:${userId}`;

const toCents = (amount) => {
  if (!Number.isFinite(amount)) {
    throw new Error(`INVALID_WALLET_AMOUNT: ${amount}`);
  }
  return Math.round(amount * 100);
};

const fromCents = (amount) => amount / 100;

exports.getWallet = async (userId) => {
  const data = await redisClient.hGetAll(walletKey(userId));

  return {
    balance: fromCents(Number(data.balance || 0)),
    locked: fromCents(Number(data.locked || 0)),
  };
};

const emitWalletUpdate = async (userId) => {
  const wallet = await exports.getWallet(userId);
  await publisher.publishWalletUpdate(userId, wallet);
  return wallet;
};

exports.lockFunds = async (userId, amount) => {
  const cents = toCents(amount);
  const wallet = await exports.getWallet(userId);
  
  if (toCents(wallet.balance) < cents) {
    throw new Error('INSUFFICIENT_FUNDS');
  }

  await redisClient.hIncrBy(walletKey(userId), 'balance', -cents);
  await redisClient.hIncrBy(walletKey(userId), 'locked', cents);
  
  return await emitWalletUpdate(userId);
};

exports.releaseFunds = async (userId, amount) => {
  const cents = toCents(amount);
  await redisClient.hIncrBy(walletKey(userId), 'locked', -cents);
  
  return await emitWalletUpdate(userId);
};

exports.settleTrade = async ({ buyerId, sellerId, tradeValue }) => {
  const cents = toCents(tradeValue);

  await redisClient.hIncrBy(walletKey(buyerId), 'locked', -cents);
  
  await redisClient.hIncrBy(walletKey(sellerId), 'balance', cents);

  const buyerWallet = await emitWalletUpdate(buyerId);
  const sellerWallet = await emitWalletUpdate(sellerId);
  
  return { buyerWallet, sellerWallet };
};

exports.topUp = async (userId, amount) => {
  if (!amount || amount <= 0) {
    throw new Error('INVALID_TOPUP_AMOUNT');
  }

  const cents = toCents(amount);
  await redisClient.hIncrBy(walletKey(userId), 'balance', cents);
  await emitWalletUpdate(userId);
};
