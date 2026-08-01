const dotenv = require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  logger_level: process.env.logger_level,
  GMAIL_PASS: process.env.GMAIL_PASS,
  GMAIL_EMAIL: process.env.GMAIL_EMAIL,
  RABBITMQ_SERVER_URL: process.env.RABBITMQ_SERVER_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};
