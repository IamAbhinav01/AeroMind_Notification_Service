const nodemailer = require('nodemailer');
const { GMAIL_EMAIL, GMAIL_PASS, RESEND_API_KEY } = require('./server.config');
const { Resend } = require('resend');

const resendMailer = new Resend(RESEND_API_KEY);

const mailsender = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASS,
  },
});

module.exports = { mailsender, resendMailer };
