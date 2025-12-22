const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: false }, 
    googleId: { type: String, unique: true, sparse: true } 
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradeSimUser', userSchema);