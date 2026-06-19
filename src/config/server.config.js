const dotenv = require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  logger_level: process.env.logger_level,
  GMAIL_PASS: process.env.GMAIL_PASS,
  GMAIL_EMAIL: process.env.GMAIL_EMAIL,
};
