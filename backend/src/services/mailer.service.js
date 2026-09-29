const transporter = require("../config/mailer");
require("dotenv").config();

const mailFrom = process.env.MAIL_FROM || "no-reply@padosipro.com";
const mailFromName = process.env.MAIL_FROM_NAME || "PadosiPro";
const fromHeader = `"${mailFromName}" <${mailFrom}>`;

/**
 * Sends Email Verification OTP to user.
 */
const sendVerificationOTP = async (email, fullName, otp) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>PadosiPro OTP Verification</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; }
        .logo { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 20px; }
        .logo span { color: #35c96b; }
        .title { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
        .otp-box { background: #f0fdf4; border: 1.5px dashed #35c96b; border-radius: 8px; font-size: 32px; font-weight: 800; color: #166534; letter-spacing: 6px; text-align: center; padding: 16px; margin: 24px 0; }
        .footer { font-size: 12px; color: #64748b; margin-top: 24px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Padosi<span>Pro</span></div>
        <div class="title">Verify your email address</div>
        <p>Hello ${fullName || "Neighbor"},</p>
        <p>Thank you for registering with PadosiPro. Use the verification code below to verify your email address:</p>
        <div class="otp-box">${otp}</div>
        <p>This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <div class="footer">If you did not request this email, please ignore it.</div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to: email,
      subject: `PadosiPro Verification Code: ${otp}`,
      html: htmlContent,
    });
    console.log(`✉️ Verification OTP email sent to ${email} (MessageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`⚠️ Failed to send OTP email to ${email}:`, error.message);
    // Return true in development to avoid blocking if SMTP is not configured
    return process.env.NODE_ENV !== "production";
  }
};

/**
 * Sends Password Reset Email to user.
 */
const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:8081";
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>PadosiPro Password Reset</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; }
        .logo { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 20px; }
        .logo span { color: #35c96b; }
        .title { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
        .btn { display: inline-block; background-color: #35c96b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { font-size: 12px; color: #64748b; margin-top: 24px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Padosi<span>Pro</span></div>
        <div class="title">Reset Your Password</div>
        <p>Hello ${fullName || "Neighbor"},</p>
        <p>We received a request to reset your password. Use the token or link below to create a new password:</p>
        <p><strong>Reset Token:</strong> <code>${resetToken}</code></p>
        <p style="text-align: center;">
          <a href="${resetLink}" class="btn">Reset Password</a>
        </p>
        <p>This link and token will expire in <strong>15 minutes</strong>.</p>
        <div class="footer">If you did not request a password reset, please ignore this email.</div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to: email,
      subject: "PadosiPro - Password Reset Request",
      html: htmlContent,
    });
    console.log(`✉️ Password reset email sent to ${email} (MessageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`⚠️ Failed to send password reset email to ${email}:`, error.message);
    return process.env.NODE_ENV !== "production";
  }
};

module.exports = {
  sendVerificationOTP,
  sendPasswordResetEmail,
};
