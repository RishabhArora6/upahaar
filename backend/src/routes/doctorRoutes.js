import express from 'express';
import { scanPatientQr, searchPatientHistoryAI } from '../controllers/doctorController.js';
import { auth, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/scan/:upahaar_id', auth, requireRole(['DOCTOR']), scanPatientQr);
router.post('/scan/:upahaar_id/ai-search', auth, requireRole(['DOCTOR']), searchPatientHistoryAI);

export default router;
