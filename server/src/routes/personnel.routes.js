import express from 'express';
import { 
  getPersonnel, 
  createPersonnel,
  updatePersonnel,
  deletePersonnel 
} from '../controllers/personnel.controller.js';

const router = express.Router();

router.get('/', getPersonnel);
router.post('/', createPersonnel);
router.patch('/:id', updatePersonnel);
router.delete('/:id', deletePersonnel);

export default router;
