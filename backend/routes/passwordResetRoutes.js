import express from 'express';
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from '../controllers/passwordResetController.js';

const router = express.Router();

// @route   POST /api/password-reset/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/password-reset/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   GET /api/password-reset/verify-token/:token
// @desc    Verify reset token validity
// @access  Public
router.get('/verify-token/:token', verifyResetToken);

export default router;