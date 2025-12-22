const walletService = require('../wallet/wallet.service');
const publisher = require('./event.publisher');
const { Order } = require('./order.model');
const { v4: uuid } = require('uuid');

class TradingService {
  constructor(matchingEngine) {
    this.matchingEngine = matchingEngine;
  }

  async placeOrder(raw) {

    const order = new Order({
      id: uuid(),
      userId: raw.userId,
      side: raw.side,
      type: raw.type,
      price: raw.price,
      quantity: raw.quantity,
    });

    if (order.side === 'BUY' && order.type === 'LIMIT') {
      const updatedWallet = await walletService.lockFunds(
        order.userId,
        order.price * order.quantity
      );

      await publisher.publishWalletUpdate(order.userId, updatedWallet);
    }

    const trades = await this.matchingEngine.process(order);

    for (const trade of trades) {
      const { buyerWallet, sellerWallet } = await walletService.settleTrade({
        buyerId: trade.buyerId,
        sellerId: trade.sellerId,
        tradeValue: trade.price * trade.quantity,
      });

      await publisher.publishTrade(trade);

      await publisher.publishWalletUpdate(trade.buyerId, buyerWallet);
      await publisher.publishWalletUpdate(trade.sellerId, sellerWallet);
    }

    await publisher.publishOrderUpdate(order.userId , order);

    return order;
  }
}

module.exports = TradingService;