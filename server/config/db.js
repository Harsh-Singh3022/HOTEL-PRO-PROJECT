const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Local MongoDB not active at ${uri} (${error.message}).`);
    
    // Auto-fallback to embedded mongodb-memory-server unless explicitly disabled
    if (process.env.USE_MEMORY_DB !== 'false') {
      try {
        console.log('[Database] Starting embedded in-memory MongoDB for seamless development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB active: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error(`[Database] In-memory fallback failed: ${memErr.message}`);
      }
    }
    throw error;
  }
};

module.exports = connectDB;
