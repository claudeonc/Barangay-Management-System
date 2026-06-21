import prisma from '../db.js';

export const getLogs = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { Timestamp: 'desc' },
      include: {
        User: {
          select: { Username: true, Role: true }
        }
      },
      take: 100 // Limit to last 100 logs for performance
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
