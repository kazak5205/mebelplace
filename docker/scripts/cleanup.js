const cron = require('node-cron');
const { cleanupInactiveSubscriptions } = require('../server/services/pushService');

// Cleanup inactive subscriptions every day at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('🧹 Running cleanup task...');
  cleanupInactiveSubscriptions().then(result => {
    console.log('✅ Cleanup completed:', result);
  }).catch(err => {
    console.error('❌ Cleanup failed:', err);
  });
});

// Keep the process running
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

console.log('✅ Cleanup scheduler started');


