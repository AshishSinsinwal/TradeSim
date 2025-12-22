const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

module.exports = async function connectMongo() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
