// const Trade = require('./trade.model');
// const { OrderStatus } = require('./order.model');

// class MatchingEngine {
//   constructor(orderBook) {
//     this.orderBook = orderBook;
//   }

//   process(order) {
//     const trades = [];

//     if (order.side === 'BUY') {
//       this.matchBuy(order, trades);
//     } else {
//       this.matchSell(order, trades);
//     }

//     // If still open and LIMIT → add to book
//     if (order.remaining > 0 && order.type === 'LIMIT') {
//       this.orderBook.add(order);
//     }

//     return trades;
//   }

//   matchBuy(order, trades) {
//     while (order.remaining > 0) {
//       const bestSell = this.orderBook.bestSell();
//       if (!bestSell) break;

//       // Price check for LIMIT orders
//       if (
//         order.type === 'LIMIT' &&
//         bestSell.price > order.price
//       ) break;

//       this.executeTrade(order, bestSell, trades);
//     }
//   }

//   matchSell(order, trades) {
//     while (order.remaining > 0) {
//       const bestBuy = this.orderBook.bestBuy();
//       if (!bestBuy) break;

//       if (
//         order.type === 'LIMIT' &&
//         bestBuy.price < order.price
//       ) break;

//       this.executeTrade(bestBuy, order, trades);
//     }
//   }

//   executeTrade(buy, sell, trades) {
//     const quantity = Math.min(buy.remaining, sell.remaining);
//     const price = sell.price; // price-time priority

//     buy.remaining -= quantity;
//     sell.remaining -= quantity;

//     const trade = new Trade({
//       buyOrderId: buy.id,
//       sellOrderId: sell.id,
//       price,
//       quantity,
//     });

//     trades.push(trade);

//     this.updateOrderStatus(buy);
//     this.updateOrderStatus(sell);

//     if (sell.remaining === 0) {
//       this.orderBook.remove(sell);
//     }
//     if (buy.remaining === 0) {
//       this.orderBook.remove(buy);
//     }
//   }

//   updateOrderStatus(order) {
//     if (order.remaining === 0) {
//       order.status = OrderStatus.FILLED;
//     } else if (order.remaining < order.quantity) {
//       order.status = OrderStatus.PARTIAL;
//     }
//   }
// }

// module.exports = MatchingEngine;
