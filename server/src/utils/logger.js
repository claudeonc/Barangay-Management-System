import prisma from '../db.js';

export const logActivity = async (userId, action) => {
  try {
    if (!userId) return;
    await prisma.activityLog.create({
      data: {
        UserID: Number(userId),
        Action: action,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
