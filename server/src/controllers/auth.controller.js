import prisma from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logActivity } from '../utils/logger.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { Username: username },
      include: { Personnel: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.UserID, role: user.Role, personnelId: user.PersonnelID },
      process.env.JWT_SECRET || 'bms_super_secret_key',
      { expiresIn: '1d' }
    );

    await logActivity(user.UserID, 'User logged into the system');

    res.json({
      token,
      user: {
        id: user.UserID,
        username: user.Username,
        role: user.Role,
        personnel: user.Personnel
      }
    });
  } catch (error) {
    next(error);
  }
};
