const mongoose = require('mongoose');

const connectDB = async () => {
  // Support both MONGODB_URI (standard cloud convention) and MONGO_URI
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelpro';

  // Normalize MongoDB Atlas URI if database name is omitted (e.g. ends with .mongodb.net/ or .mongodb.net)
  if (uri.startsWith('mongodb+srv://')) {
    if (uri.endsWith('.mongodb.net/')) {
      uri = uri + 'hotelpro?retryWrites=true&w=majority';
    } else if (uri.endsWith('.mongodb.net')) {
      uri = uri + '/hotelpro?retryWrites=true&w=majority';
    }
  }

  const maskedUri = uri.replace(/:[^:@]+@/, ':****@');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Primary MongoDB connection failed at ${maskedUri}: ${error.message}`);

    // In production, do not attempt to load development-only in-memory server
    if (process.env.NODE_ENV !== 'production' && process.env.USE_MEMORY_DB !== 'false') {
      try {
        console.log('[Database] Starting embedded in-memory MongoDB for offline development...');
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
