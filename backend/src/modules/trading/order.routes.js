const router = require('express').Router();
const { authGuard } = require('../auth/auth.middleware');
const tradingService = require('./index');
const orderRepo = require('./order.repository');

router.use(authGuard);

router.post('/', async (req, res) => {
  const { side, type, price, quantity } = req.body;
  const order = await tradingService.placeOrder({
    userId: req.userId,
    side,
    type,
    price,
    quantity,
  });
  res.status(201).json(order);
});

router.get('/open', async (req, res) => {
  try {
    const orders = await orderRepo.getOpenOrdersByUser(
      req.userId, 
      tradingService.matchingEngine.orderBook
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch open orders' });
  }
});

router.get('/trades', async (req, res) => {
  try {
    const trades = await orderRepo.getRecentTrades(50);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

module.exports = router;