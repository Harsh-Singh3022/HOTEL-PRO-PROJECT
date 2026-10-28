const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config(); // Fallback for root or environment variables
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const { seedData } = require('./utils/seeder');

const PORT = process.env.PORT || 5000;

// Immediately start listening on 0.0.0.0 (required for Render, Railway, Docker, cloud containers)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` HotelPro Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Listening on: 0.0.0.0:${PORT}`);
  console.log(` Base API: /api/v1`);
  console.log(` Health:   /api/v1/health`);
  console.log(`===============================================`);
});

// Connect to MongoDB asynchronously without blocking the web listener
connectDB()
  .then(async () => {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Bootstrap] Database is empty. Auto-seeding initial demo records...');
        await seedData();
      } else {
        console.log(`[Bootstrap] Database ready with ${userCount} existing registered users.`);
      }
    } catch (seedErr) {
      console.warn('[Bootstrap] Auto-seed check note:', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('[Database Warning] MongoDB connection failed:', err.message);
    console.log('[Server Notice] Web service is running to serve health checks and diagnostic status.');
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
