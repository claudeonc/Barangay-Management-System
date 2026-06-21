import prisma from '../db.js';
import { logActivity } from '../utils/logger.js';

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        Resident: true,
        Issuer: {
          include: {
            Resident: true // Get the personnel's name
          }
        }
      }
    });
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    let { ResidentID, DocumentType, IssuedBy, Purpose, Status } = req.body;
    
    // Ensure IssuedBy is valid
    const personnel = await prisma.personnel.findUnique({ where: { PersonnelID: Number(IssuedBy) } });
    if (!personnel) {
      const firstPersonnel = await prisma.personnel.findFirst();
      if (!firstPersonnel) return res.status(400).json({ error: 'No personnel exists to issue documents' });
      IssuedBy = firstPersonnel.PersonnelID;
    }

    const newDoc = await prisma.document.create({
      data: {
        ResidentID: Number(ResidentID),
        DocumentType,
        DateIssued: new Date(),
        IssuedBy: Number(IssuedBy),
        Purpose,
        Status
      }
    });

    await logActivity(req.user.userId, `Issued new document: ${DocumentType} for resident ID: ${ResidentID}`);

    res.status(201).json(newDoc);
  } catch (error) {
    next(error);
  }
};

export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    const updatedDoc = await prisma.document.update({
      where: { DocumentID: Number(id) },
      data: { Status }
    });

    await logActivity(req.user.userId, `Updated document status ID: ${id}`);

    res.json(updatedDoc);
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { DocumentID: Number(id) },
      include: {
        Resident: {
          include: {
            Household: true
          }
        },
        Issuer: {
          include: {
            Resident: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ResidentID, DocumentType, Purpose, Status } = req.body;

    const updatedDoc = await prisma.document.update({
      where: { DocumentID: Number(id) },
      data: {
        ResidentID: ResidentID ? Number(ResidentID) : undefined,
        DocumentType,
        Purpose,
        Status
      }
    });

    await logActivity(req.user.userId, `Updated document ID: ${id}`);

    res.json(updatedDoc);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({
      where: { DocumentID: Number(id) }
    });

    await logActivity(req.user.userId, `Deleted document ID: ${id}`);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
