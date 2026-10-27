require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const { seedData } = require('./utils/seeder');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
  // Check if database needs seeding
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] Database is empty. Auto-seeding initial demo records...');
      await seedData();
    }
  } catch (seedErr) {
    console.warn('[Bootstrap] Auto-seed check note:', seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` HotelPro Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(` Listening on port: ${PORT}`);
    console.log(` Base API: http://localhost:${PORT}/api/v1`);
    console.log(` Health:   http://localhost:${PORT}/api/v1/health`);
    console.log(`===============================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });
}).catch((err) => {
  console.error('Failed to initialize server:', err.message);
});
