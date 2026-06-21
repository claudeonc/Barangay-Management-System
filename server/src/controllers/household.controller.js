import prisma from '../db.js';
import { logActivity } from '../utils/logger.js';

export const getHouseholds = async (req, res, next) => {
  try {
    const households = await prisma.household.findMany({
      include: {
        HeadResident: true,
        Residents: true
      }
    });
    res.json(households);
  } catch (error) {
    next(error);
  }
};

export const getHouseholdById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const household = await prisma.household.findUnique({
      where: { HouseholdID: Number(id) },
      include: {
        HeadResident: true,
        Residents: true
      }
    });
    if (!household) {
      return res.status(404).json({ error: 'Household not found' });
    }
    res.json(household);
  } catch (error) {
    next(error);
  }
};

export const createHousehold = async (req, res, next) => {
  try {
    const { HouseNo, Street, SubVillage, HeadOfFamily } = req.body;
    const newHousehold = await prisma.household.create({
      data: {
        HouseNo,
        Street,
        SubVillage,
        HeadOfFamily: Number(HeadOfFamily)
      }
    });

    await logActivity(req.user.userId, `Registered new household at ${HouseNo} ${Street}`);

    res.status(201).json(newHousehold);
  } catch (error) {
    next(error);
  }
};

export const updateHousehold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { HouseNo, Street, SubVillage, HeadOfFamily } = req.body;

    const updateData = {
      HouseNo,
      Street,
      SubVillage,
      HeadOfFamily: HeadOfFamily ? Number(HeadOfFamily) : undefined
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedHousehold = await prisma.household.update({
      where: { HouseholdID: Number(id) },
      data: updateData
    });

    await logActivity(req.user.userId, `Updated household ID: ${id}`);

    res.json(updatedHousehold);
  } catch (error) {
    next(error);
  }
};

export const deleteHousehold = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.household.delete({
      where: { HouseholdID: Number(id) }
    });

    await logActivity(req.user.userId, `Deleted household ID: ${id}`);

    res.json({ message: 'Household deleted successfully' });
  } catch (error) {
    next(error);
  }
};
