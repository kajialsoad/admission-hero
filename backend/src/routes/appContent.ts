import express from 'express';
import {
  getAllContent,
  getContentByKey,
  getPublishedContent,
  upsertContent,
  deleteContent,
  initializeDefaultContent,
} from '../controllers/appContentController';
import { protect, adminOnly } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/published', getPublishedContent);
router.get('/:key', getContentByKey);

// Admin routes
router.get('/', protect, adminOnly, getAllContent);
router.post('/', protect, adminOnly, upsertContent);
router.put('/:key', protect, adminOnly, upsertContent);
router.delete('/:key', protect, adminOnly, deleteContent);
router.post('/initialize', protect, adminOnly, initializeDefaultContent);

export default router;
