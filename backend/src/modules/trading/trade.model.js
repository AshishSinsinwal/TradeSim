class Trade {
  constructor({
    buyOrderId,
    sellOrderId,
    buyerId,
    sellerId,
    price,
    quantity,
  }) {
    this.buyOrderId = buyOrderId;
    this.sellOrderId = sellOrderId;
    this.buyerId = buyerId;
    this.sellerId = sellerId;
    this.price = price;
    this.quantity = quantity;
    this.timestamp = Date.now();
  }
}

module.exports = Trade;
