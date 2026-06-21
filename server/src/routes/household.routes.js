import express from 'express';
import {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold
} from '../controllers/household.controller.js';

const router = express.Router();

router.get('/', getHouseholds);
router.get('/:id', getHouseholdById);
router.post('/', createHousehold);
router.patch('/:id', updateHousehold);
router.delete('/:id', deleteHousehold);

export default router;
