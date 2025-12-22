const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const walletRoutes = require('./modules/wallet/wallet.routes');
const orderRoutes = require('./modules/trading/order.routes');

const app = express();

app.use(cors({
    origin : "*",
    credentials : true
}));

app.use(express.json());

app.use('/auth' , authRoutes);
app.use('/wallet' , walletRoutes);
app.use('/orders' , orderRoutes);

module.exports = app;