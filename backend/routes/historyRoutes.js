import express from 'express';
import { getHistory, addHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getHistory).post(protect, addHistory);

export default router;
