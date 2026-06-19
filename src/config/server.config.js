const dotenv = require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  logger_level: process.env.logger_level,
};
