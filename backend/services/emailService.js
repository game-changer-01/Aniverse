const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // Use environment variables for email configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  } else if (process.env.SMTP_HOST) {
    // Generic SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  
  // Development fallback - log to console
  return {
    sendMail: async (options) => {
      console.log('📧 Email would be sent in production:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Content:', options.html || options.text);
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

const sendAdminNotification = async (user, loginMethod = 'google') => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.log('Admin email not configured');
      return;
    }

    const emailContent = {
      from: process.env.ADMIN_EMAIL || 'noreply@aniverse.com',
      to: adminEmail,
      subject: `🚨 New User Login - ${user.username || user.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">🎌 AniVerse - New User Alert</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">New User Registration via ${loginMethod.toUpperCase()}</h2>
            
            <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">User Details:</h3>
              <p><strong>Username:</strong> ${user.username || 'Not provided'}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Login Method:</strong> ${loginMethod}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>User ID:</strong> ${user._id}</p>
              ${user.picture ? `<p><strong>Profile Picture:</strong> <a href="${user.picture}">View</a></p>` : ''}
            </div>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <h4 style="color: #2e7d32; margin-top: 0;">Next Steps:</h4>
              <ul style="color: #333;">
                <li>User can now access personalized recommendations</li>
                <li>Monitor user engagement and preferences</li>
                <li>Consider reaching out for feedback if needed</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5001/admin/users" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View User Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated notification from AniVerse Admin System</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(emailContent);
    console.log('Admin notification sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // Don't throw error to avoid disrupting user registration
  }
};

const sendUserWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const emailContent = {
      from: process.env.ADMIN_EMAIL || 'noreply@aniverse.com',
      to: user.email,
      subject: '🎌 Welcome to AniVerse!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🎌 Welcome to AniVerse!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey into the anime universe begins now</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${user.username || user.email.split('@')[0]}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for joining AniVerse! We're excited to help you discover amazing anime tailored to your taste.
            </p>
            
            <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>🤖 Get AI-powered anime recommendations</li>
                <li>📊 Track your watching progress</li>
                <li>🎯 Discover new anime based on your preferences</li>
                <li>⭐ Rate and review your favorite shows</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/recommendations" style="background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Start Exploring Anime
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Happy watching! 🍿</p>
            <p>The AniVerse Team</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(emailContent);
    console.log('Welcome email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

const sendVerificationRequest = async (user) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) return;

    const emailContent = {
      from: process.env.ADMIN_EMAIL || 'noreply@aniverse.com',
      to: adminEmail,
      subject: `🔐 Verification Request - ${user.username || user.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">🔐 Identity Verification Request</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">User Requesting Verification</h2>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; margin-top: 0;">User Details:</h3>
              <p><strong>Username:</strong> ${user.username || 'Not provided'}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Current Status:</strong> ${user.verified ? 'Verified' : 'Unverified'}</p>
              <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5001/admin/verify/${user._id}" style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Process Verification
              </a>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(emailContent);
    console.log('Verification request sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send verification request:', error);
  }
};

module.exports = {
  sendAdminNotification,
  sendUserWelcomeEmail,
  sendVerificationRequest
};