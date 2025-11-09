const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Career Guidance Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to Career Guidance Platform</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verificationUrl}" 
           style="background-color: #1976d2; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendNotificationEmail = async (email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Career Guidance Platform Notification</h2>
        <p>${message}</p>
        <p>Login to your account to view more details.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendNotificationEmail
};