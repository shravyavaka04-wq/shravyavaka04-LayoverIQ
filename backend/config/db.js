const mongoose = require('mongoose');

// In-Memory fallback store if MongoDB is not running or URI not configured
const inMemoryStore = {
  users: new Map(),
  trips: new Map()
};

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI configured. Running with high-performance In-Memory Data Store.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnectedToMongo = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed (${error.message}). Falling back seamlessly to In-Memory Data Store.`);
    isConnectedToMongo = false;
  }
};

const getStore = () => ({
  isMongo: isConnectedToMongo,
  inMemoryStore
});

module.exports = {
  connectDB,
  getStore,
  inMemoryStore
};
