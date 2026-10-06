// server/utils/email.js
require('dotenv').config();

let sgMail = null;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (e) {
  // @sendgrid/mail is optional in dev / local environment
}

/**
 * Send a generic email.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} html HTML body
 */
const sendEmail = async (to, subject, html) => {
  if (!sgMail || !process.env.SENDGRID_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'no-reply@fooddelivery.com',
    subject,
    html,
  };
  await sgMail.send(msg);
};

/**
 * Send verification email with a 6‑digit OTP.
 */
const sendVerificationEmail = async (to, otp) => {
  const html = `<p>Welcome! Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`;
  await sendEmail(to, 'Verify your email', html);
};

module.exports = { sendEmail, sendVerificationEmail };
