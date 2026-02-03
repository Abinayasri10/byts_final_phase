import crypto from 'crypto';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from '../services/brevoEmailService.js';

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Always return the same message regardless of whether email exists
    // This prevents email enumeration attacks
    const successMessage = 'If this email exists in our system, a password reset link has been sent.';

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Even if user doesn't exist, return success message (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage,
      });
    }

    // Delete any existing password reset tokens for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase().trim() });

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing (additional security)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiry time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save token to database
    await PasswordReset.create({
      email: email.toLowerCase().trim(),
      token: hashedToken,
      expiresAt,
    });

    // Send email with reset link
    await sendPasswordResetEmail(email, resetToken, user.email);

    res.status(200).json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Hash the token to match stored format
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find password reset record
    const passwordReset = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() }, // Check if not expired
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Find user
    const user = await User.findOne({ email: passwordReset.email });

    if (!user) {
      // Clean up invalid reset record
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user password
    // The User model's pre-save hook will hash the password
    user.password = password;
    await user.save();

    // Delete the used token (single-use token)
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    // Delete all other password reset tokens for this user
    await PasswordReset.deleteMany({ email: passwordReset.email });

    // Log success
    console.log(`✅ Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
};

/**
 * @desc    Verify reset token validity
 * @route   GET /api/auth/verify-reset-token/:token
 * @access  Public
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is not expired
    const passwordReset = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      email: passwordReset.email,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred',
    });
  }
};