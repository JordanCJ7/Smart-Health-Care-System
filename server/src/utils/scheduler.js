import cron from 'node-cron';
import DoctorSchedule from '../models/DoctorSchedule.js';
import Waitlist from '../models/Waitlist.js';

/**
 * Schedule job to release expired slot holds (runs every 5 minutes)
 * UC-002 Extension 5a: Release hold after timeout
 */
export const scheduleSlotHoldCleaner = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const releasedCount = await DoctorSchedule.releaseExpiredHolds();
      if (releasedCount > 0) {
        console.log(`Released ${releasedCount} expired slot holds`);
      }
    } catch (error) {
      console.error('Error releasing expired holds:', error);
    }
  });

  console.log('✅ Slot hold cleaner scheduled (every 5 minutes)');
};

/**
 * Schedule job to expire old waitlist entries (runs daily at midnight)
 */
export const scheduleWaitlistCleaner = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await Waitlist.updateMany(
        {
          status: 'Active',
          expiresAt: { $lt: new Date() },
        },
        {
          $set: { status: 'Expired' },
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Expired ${result.modifiedCount} old waitlist entries`);
      }
    } catch (error) {
      console.error('Error expiring waitlist entries:', error);
    }
  });

  console.log('✅ Waitlist cleaner scheduled (daily at midnight)');
};

/**
 * Initialize all scheduled jobs
 */
export const initScheduledJobs = () => {
  scheduleSlotHoldCleaner();
  scheduleWaitlistCleaner();
};
