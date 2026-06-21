import prisma from '../db.js';
import { logActivity } from '../utils/logger.js';

// Get all residents
export const getResidents = async (req, res, next) => {
  try {
    const residents = await prisma.resident.findMany({
      include: {
        Household: true
      }
    });
    res.json(residents);
  } catch (error) {
    next(error);
  }
};

// Get single resident
export const getResidentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resident = await prisma.resident.findUnique({
      where: { ResidentID: Number(id) },
      include: {
        Household: true,
        Documents: true,
      }
    });
    if (!resident) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(resident);
  } catch (error) {
    next(error);
  }
};

// Create a new resident
export const createResident = async (req, res, next) => {
  try {
    const {
      FirstName,
      LastName,
      Birthdate,
      Gender,
      CivilStatus,
      Occupation,
      ContactNo,
      HouseholdID
    } = req.body;

    const newResident = await prisma.resident.create({
      data: {
        FirstName,
        LastName,
        Birthdate: new Date(Birthdate),
        Gender,
        CivilStatus,
        Occupation,
        ContactNo,
        HouseholdID: HouseholdID ? Number(HouseholdID) : null
      }
    });

    await logActivity(req.user.userId, `Registered new resident: ${LastName}, ${FirstName}`);

    res.status(201).json(newResident);
  } catch (error) {
    next(error);
  }
};

// Update a resident
export const createBulkResidents = async (req, res, next) => {
  try {
    const residents = req.body; // Expecting array of objects

    if (!Array.isArray(residents) || residents.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty data provided.' });
    }

    // Process and validate fields, ignoring completely empty rows
    const dataToInsert = residents
      .filter(r => r.FirstName && r.LastName && r.Birthdate)
      .map((r) => ({
        FirstName: r.FirstName,
        LastName: r.LastName,
        Birthdate: new Date(r.Birthdate),
        Gender: r.Gender,
        CivilStatus: r.CivilStatus,
        Occupation: r.Occupation || null,
        ContactNo: r.ContactNo || null,
        HouseholdID: r.HouseholdID ? Number(r.HouseholdID) : null,
      }));

    const result = await prisma.resident.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    await logActivity(req.user.userId, `Bulk imported ${result.count} residents via CSV`);

    res.status(201).json({ message: `Successfully imported ${result.count} residents`, count: result.count });
  } catch (error) {
    next(error);
  }
};

export const updateResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      FirstName,
      LastName,
      Birthdate,
      Gender,
      CivilStatus,
      Occupation,
      ContactNo,
      HouseholdID
    } = req.body;

    const updateData = {
      FirstName,
      LastName,
      Birthdate: Birthdate ? new Date(Birthdate) : undefined,
      Gender,
      CivilStatus,
      Occupation,
      ContactNo,
      HouseholdID: HouseholdID ? Number(HouseholdID) : null
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedResident = await prisma.resident.update({
      where: { ResidentID: Number(id) },
      data: updateData
    });

    await logActivity(req.user.userId, `Updated resident ID: ${id}`);

    res.json(updatedResident);
  } catch (error) {
    next(error);
  }
};

// Delete a resident
export const deleteResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.resident.delete({
      where: { ResidentID: Number(id) }
    });

    await logActivity(req.user.userId, `Deleted resident ID: ${id}`);

    res.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    next(error);
  }
};
