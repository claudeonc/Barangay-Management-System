import express from 'express';
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocumentStatus,
  updateDocument,
  deleteDocument
} from '../controllers/document.controller.js';

const router = express.Router();

router.get('/', getDocuments);
router.get('/:id', getDocument);
router.post('/', createDocument);
router.patch('/:id/status', updateDocumentStatus);
router.patch('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
