import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send password reset email using Resend
 */
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: 'PlaceHub <onboarding@resend.dev>', // Free tier uses this sender
      to: [email],
      subject: 'Password Reset Request - PlaceHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #071952 0%, #088395 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #071952 0%, #088395 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .link-box { word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              
              <p>We received a request to reset your password for your <strong>PlaceHub</strong> account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button" style="color: white;">Reset My Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">${resetLink}</div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in <strong>15 minutes</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              
              <p>Thanks,<br><strong>The PlaceHub Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© 2026 PlaceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Password reset email sent to ${email}`);
    console.log(`📧 Email ID: ${data.id}`);
    
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (email, userName = 'User') => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'API key not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'PlaceHub <onboarding@resend.dev>',
      to: [email],
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
              <p>Hello,</p>
              
              <div class="success-box">
                <strong>✓ Your password has been successfully reset!</strong>
              </div>
              
              <p>You can now log in to PlaceHub using your new password.</p>
              
              <p>If you didn't make this change, please contact support immediately.</p>
              
              <p>Thanks,<br><strong>The PlaceHub Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2026 PlaceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log(`✅ Confirmation email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending confirmation:', error);
    return { success: false, error: error.message };
  }
};