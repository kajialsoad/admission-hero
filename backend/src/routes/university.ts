import { Router } from 'express';
import {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '../controllers/universityController';

const router = Router();


// CRUD routes
router.get('/', getUniversities);
router.get('/:id', getUniversity);
router.post('/', createUniversity);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);

export default router;