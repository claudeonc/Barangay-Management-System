import prisma from '../db.js';
import bcrypt from 'bcryptjs';
import { logActivity } from '../utils/logger.js';

export const getPersonnel = async (req, res, next) => {
  try {
    const personnel = await prisma.personnel.findMany({
      include: {
        Resident: true,
        Users: {
          select: { Username: true, Role: true }
        }
      },
      orderBy: { PersonnelID: 'desc' }
    });
    res.json(personnel);
  } catch (error) {
    next(error);
  }
};

export const createPersonnel = async (req, res, next) => {
  try {
    const { ResidentID, Position, EmploymentType, TermStart, TermEnd, createAccount, username, password, role } = req.body;

    // Start a transaction since we might create a Personnel AND a User
    const newPersonnel = await prisma.$transaction(async (tx) => {
      const personnel = await tx.personnel.create({
        data: {
          ResidentID: Number(ResidentID),
          Position,
          EmploymentType,
          TermStart: TermStart ? new Date(TermStart) : null,
          TermEnd: TermEnd ? new Date(TermEnd) : null,
        }
      });

      if (createAccount && username && password) {
        // Check if username exists
        const existingUser = await tx.user.findUnique({ where: { Username: username } });
        if (existingUser) {
          throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await tx.user.create({
          data: {
            Username: username,
            Password: hashedPassword,
            Role: role || 'STAFF',
            PersonnelID: personnel.PersonnelID
          }
        });
      }

      return personnel;
    });

    await logActivity(req.user.userId, `Registered new personnel ID: ${newPersonnel.PersonnelID}`);
    res.status(201).json(newPersonnel);
  } catch (error) {
    if (error.message === 'Username already exists') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const updatePersonnel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ResidentID, Position, EmploymentType, TermStart, TermEnd } = req.body;
    
    const updatedPersonnel = await prisma.personnel.update({
      where: { PersonnelID: Number(id) },
      data: {
        ResidentID: ResidentID ? Number(ResidentID) : undefined,
        Position,
        EmploymentType,
        TermStart: TermStart ? new Date(TermStart) : null,
        TermEnd: TermEnd ? new Date(TermEnd) : null,
      }
    });

    await logActivity(req.user.userId, `Updated personnel ID: ${id}`);

    res.json(updatedPersonnel);
  } catch (error) {
    next(error);
  }
};

export const deletePersonnel = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.personnel.delete({
      where: { PersonnelID: Number(id) }
    });

    await logActivity(req.user.userId, `Deleted personnel ID: ${id}`);

    res.json({ message: 'Personnel deleted successfully' });
  } catch (error) {
    next(error);
  }
};
