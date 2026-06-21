import express from 'express';
import {
  getResidents,
  getResidentById,
  createResident,
  createBulkResidents,
  updateResident,
  deleteResident
} from '../controllers/resident.controller.js';

const router = express.Router();

router.get('/', getResidents);
router.get('/:id', getResidentById);
router.post('/', createResident);
router.post('/bulk', createBulkResidents);
router.patch('/:id', updateResident);
router.delete('/:id', deleteResident);

export default router;
