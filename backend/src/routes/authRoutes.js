import express from 'express';
import { registerUser, loginUser, generate2FA, verifyAndEnable2FA } from '../controllers/authController.js';
import { auth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// 2FA Routes (requires user to be logged in to set them up)
router.post('/2fa/generate', auth, generate2FA);
router.post('/2fa/turn-on', auth, verifyAndEnable2FA);

export default router;
