import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Check if in development mode (no real email sending)
const isDevelopmentMode = process.env.EMAIL_DEV_MODE === 'true';

// Create transporter
const createTransporter = () => {
  // For production, use actual email service (Gmail, SendGrid, AWS SES, etc.)
  // For development, you can use Ethereal (fake SMTP service)
  
  if (isDevelopmentMode) {
    // Return a mock transporter that doesn't actually send emails
    return null;
  }
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name (optional)
 */
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  try {
    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // In development mode, save email to file instead of sending
    if (isDevelopmentMode) {
      const emailContent = {
        to: email,
        subject: 'Password Reset Request - PlaceHub',
        resetLink: resetLink,
        token: resetToken,
        timestamp: new Date().toISOString(),
      };
      
      // Save to emails folder
      const emailsDir = path.join(process.cwd(), 'dev-emails');
      if (!fs.existsSync(emailsDir)) {
        fs.mkdirSync(emailsDir, { recursive: true });
      }
      
      const filename = `reset-${Date.now()}.json`;
      fs.writeFileSync(
        path.join(emailsDir, filename),
        JSON.stringify(emailContent, null, 2)
      );
      
      console.log('\n🔗 PASSWORD RESET EMAIL (Development Mode)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 To: ${email}`);
      console.log(`🔑 Token: ${resetToken}`);
      console.log(`🌐 Reset Link: ${resetLink}`);
      console.log(`📁 Saved to: dev-emails/${filename}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      return { success: true, messageId: `dev-mode-${Date.now()}` };
    }
    
    const transporter = createTransporter();
    
    // Email content
    const mailOptions = {
      from: `"PlaceHub Support" <${process.env.EMAIL_USER}>`,
      to: email,
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
                <ul style="margin: 10px 0;">
                  <li>This link will expire in <strong>15 minutes</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
              
              <p>Need help? Contact us at support@placehub.com</p>
              
              <p>Best regards,<br>The PlaceHub Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2026 PlaceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${userName},
        
        We received a request to reset your password for your PlaceHub account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        Important:
        - This link will expire in 15 minutes
        - If you didn't request this reset, please ignore this email
        - Your password will remain unchanged until you create a new one
        
        Need help? Contact us at support@placehub.com
        
        Best regards,
        The PlaceHub Team
      `,
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - Recipient email
 * @param {string} userName - User's name (optional)
 */
export const sendPasswordResetConfirmation = async (email, userName = 'User') => {
  try {
    // In development mode, just log
    if (isDevelopmentMode) {
      console.log(`\n✅ Password reset confirmed for: ${email}\n`);
      return { success: true };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PlaceHub Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Successfully Reset - PlaceHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
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
              
              <div class="success">
                <strong>Your password has been successfully reset!</strong>
              </div>
              
              <p>You can now log in to your PlaceHub account using your new password.</p>
              
              <p><strong>If you did not make this change:</strong></p>
              <ul>
                <li>Please contact our support team immediately at support@placehub.com</li>
                <li>Change your password as soon as possible</li>
              </ul>
              
              <p>Best regards,<br>The PlaceHub Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2026 PlaceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};