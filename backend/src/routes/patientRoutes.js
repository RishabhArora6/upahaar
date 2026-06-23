import express from 'express';
import { getProfile, updateProfile, uploadPrescription, getTimeline, getNearbyPharmacies, deletePrescription, getNotifications, acknowledgeNotification, revokeNotificationAccess } from '../controllers/patientController.js';
import { auth, requireRole } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, requireRole(['CITIZEN']), updateProfile);

// Prescriptions
router.post('/prescriptions', auth, upload.single('prescriptionFile'), uploadPrescription);
router.get('/timeline', auth, getTimeline);
router.delete('/prescriptions/:id', auth, deletePrescription);
router.get('/pharmacies', auth, getNearbyPharmacies);

// Notifications & Access Control
router.get('/notifications', auth, requireRole(['CITIZEN']), getNotifications);
router.post('/notifications/:id/acknowledge', auth, requireRole(['CITIZEN']), acknowledgeNotification);
router.post('/notifications/:id/revoke', auth, requireRole(['CITIZEN']), revokeNotificationAccess);

export default router;
