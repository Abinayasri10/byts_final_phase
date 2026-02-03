import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send password reset email using SendGrid
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name (optional)
 */
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Email content
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL, // Must be a verified sender in SendGrid
      subject: 'Password Reset Request - PlaceHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #071952 0%, #088395 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #071952 0%, #088395 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <p>We received a request to reset your password for your PlaceHub account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetLink}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in <strong>15 minutes</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              
              <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
              
              <p>Thanks,<br>The PlaceHub Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© 2026 PlaceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${userName},

We received a request to reset your password for your PlaceHub account.

Click the link below to reset your password:
${resetLink}

⚠️ Important:
- This link will expire in 15 minutes
- If you didn't request this reset, please ignore this email
- Your password won't change until you create a new one

Thanks,
The PlaceHub Team

This is an automated message, please do not reply to this email.
© 2026 PlaceHub. All rights reserved.`
    };

    await sgMail.send(msg);
    
    console.log(`✅ Password reset email sent successfully to ${email}`);
    return { success: true, messageId: 'sendgrid-sent' };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    if (error.response) {
      console.error('SendGrid Error Response:', error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send password reset confirmation email using SendGrid
 * @param {string} email - Recipient email
 * @param {string} userName - User's name (optional)
 */
export const sendPasswordResetConfirmation = async (email, userName = 'User') => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Password Successfully Reset - PlaceHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #071952 0%, #088395 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <div class="success-box">
                <strong>✓ Your password has been successfully reset!</strong>
              </div>
              
              <p>You can now log in to PlaceHub using your new password.</p>
              
              <p>If you didn't make this change or if you believe an unauthorized person has accessed your account, please contact our support team immediately.</p>
              
              <p>Thanks,<br>The PlaceHub Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© 2026 PlaceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${userName},

✓ Your password has been successfully reset!

You can now log in to PlaceHub using your new password.

If you didn't make this change or if you believe an unauthorized person has accessed your account, please contact our support team immediately.

Thanks,
The PlaceHub Team

This is an automated message, please do not reply to this email.
© 2026 PlaceHub. All rights reserved.`
    };

    await sgMail.send(msg);
    
    console.log(`✅ Password reset confirmation sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    if (error.response) {
      console.error('SendGrid Error Response:', error.response.body);
    }
    // Don't throw error for confirmation email - password was already reset
    return { success: false, error: error.message };
  }
};