import cron from 'node-cron';
import { notificationService } from '../services/notificationService.js';

/**
 * Initialize all scheduled tasks
 */
export const initCronJobs = () => {
  // Schedule: Every Monday at 8:00 AM
  // Format: (minute hour day-of-month month day-of-week)
  cron.schedule('0 8 * * 1', async () => {
    console.log('Running Weekly Driver Manifest Cron Job...');
    await notificationService.sendWeeklyDriverReminders();
  });

  console.log('Cron Jobs Initialized: Weekly manifest scheduled for Mondays at 08:00.');
};
