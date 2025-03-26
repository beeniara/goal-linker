/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require('nodemailer');

// Initialize Firebase Admin (optional, for Firestore access if needed later)
const admin = require('firebase-admin');
admin.initializeApp();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail address
    pass: 'your-app-password', // Replace with your Gmail App Password
  },
});

exports.sendEmailNotification = onRequest(async (req, res) => {
  const { to, subject, body } = req.body;

  // Validate request body
  if (!to || !subject || !body) {
    logger.error("Missing required fields: to, subject, or body", { to, subject, body });
    return res.status(400).send('Missing required fields: to, subject, or body');
  }

  const mailOptions = {
    from: 'your-email@gmail.com', // Replace with your Gmail address
    to,
    subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully", { to, subject });
    res.status(200).send('Email sent successfully');
  } catch (error) {
    logger.error("Error sending email:", error);
    res.status(500).send('Failed to send email');
  }
});