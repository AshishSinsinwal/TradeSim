
export const WS_EVENTS = {
  TRADE_EXECUTED: 'trade_executed',
  ORDER_UPDATED: 'order_updated',
  WALLET_UPDATED: 'wallet_updated',
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  TOP_UP: '/api/wallet/top-up',
  PLACE_ORDER: '/api/trading/order',
  CANCEL_ORDER: '/api/trading/cancel',
};

export const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'LINK/USD'];
