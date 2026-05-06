import User from '../models/User';
import cron from 'node-cron';

/**
 * Check and update expired subscriptions
 * Runs every day at midnight (00:00)
 */
export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Find all Premium users whose subscription has expired
    const expiredUsers = await User.find({
      subscriptionStatus: 'Premium',
      subscriptionExpireAt: { $lt: now }
    });

    if (expiredUsers.length === 0) {
      console.log('✅ No expired subscriptions found');
      return;
    }

    console.log(`🔄 Found ${expiredUsers.length} expired subscription(s). Updating...`);

    // Update all expired users to free status
    const result = await User.updateMany(
      {
        subscriptionStatus: 'Premium',
        subscriptionExpireAt: { $lt: now }
      },
      {
        $set: {
          subscriptionStatus: 'free',
          subscriptionType: null,
          subscriptionExpireAt: null
        }
      }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} user(s) to free status`);
    
    // Log each user for tracking
    expiredUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.phone}) - Expired on ${user.subscriptionExpireAt}`);
    });

  } catch (error) {
    console.error('❌ Error checking expired subscriptions:', error);
  }
};

/**
 * Initialize the cron job
 * Runs every day at midnight (00:00)
 */
export const initSubscriptionExpiryJob = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running subscription expiry check...');
    await checkExpiredSubscriptions();
  });

  // Also run every hour to catch any missed expirations
  cron.schedule('0 * * * *', async () => {
    await checkExpiredSubscriptions();
  });

  console.log('✅ Subscription expiry job initialized');
  console.log('   - Daily check: Every day at 00:00');
  console.log('   - Hourly check: Every hour at :00');
  
  // Run once on startup to catch any already expired subscriptions
  console.log('🔄 Running initial subscription expiry check...');
  checkExpiredSubscriptions();
};
