const router = require('express').Router();
const { authGuard } = require('../auth/auth.middleware');
const walletService = require('./wallet.service');

router.use(authGuard);

router.get('/', async (req, res) => {
  const wallet = await walletService.getWallet(req.userId);
  res.json({
    ...wallet,
    available: wallet.balance - wallet.locked
  });
});

router.post('/topup', async (req, res) => {
  const { amount } = req.body;
  console.log(`Top-up request received for user ${req.userId} with amount ${amount}`);
  await walletService.topUp(req.userId, amount);
  res.status(204).end();
});

module.exports = router;
