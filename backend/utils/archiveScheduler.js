import Question from '../models/Question.js';

export const startArchiveScheduler = () => {
  // Run every 30 seconds to check for questions older than 2 minutes
  setInterval(async () => {
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      await Question.updateMany(
        { status: { $ne: 'archived' }, createdAt: { $lt: twoMinutesAgo } },
        { status: 'archived' }
      );
      console.log('Archive scheduler: Questions archived successfully');
    } catch (error) {
      console.error('Archive scheduler error:', error);
    }
  }, 30 * 1000); // Check every 30 seconds
};
