class OrderBook {
  constructor() {
    this.buys = [];
    this.sells = [];
  }

  add(order) {
    const book = order.side === 'BUY' ? this.buys : this.sells;
    book.push(order);
    this.sort(book, order.side);
  }

  sort(book, side) {
    book.sort((a, b) => {
      if (a.price !== b.price) {
        return side === 'BUY'
          ? b.price - a.price
          : a.price - b.price;
      }
      return a.timestamp - b.timestamp;
    });
  }

  bestBuy() {
    return this.buys[0]?.id;
  }

  bestSell() {
    return this.sells[0];
  }

  remove(order) {
    const book = order.side === 'BUY' ? this.buys : this.sells;
    const index = book.findIndex(o => o.id === order.id);
    if (index !== -1) book.splice(index, 1);
  }
}

module.exports = OrderBook;
