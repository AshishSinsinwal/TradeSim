const OrderStatus = {
  OPEN: 'OPEN',
  PARTIAL: 'PARTIAL',
  FILLED: 'FILLED',
};

const OrderType = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
};

const OrderSide = {
  BUY: 'BUY',
  SELL: 'SELL',
};

class Order {
  constructor({
    id,
    userId,
    side,
    type,
    price,
    quantity,
    timestamp = Date.now(),
  }) {
    this.id = id;
    this.userId = userId;
    this.side = side;
    this.type = type;
    this.price = price;
    this.quantity = quantity;
    this.remaining = quantity;
    this.status = OrderStatus.OPEN;
    this.timestamp = timestamp;
  }
}

module.exports = {
  Order,
  OrderStatus,
  OrderType,
  OrderSide,
};
