const amqplib = require('amqplib');
const { RABBITMQ_SERVER_URL, GMAIL_EMAIL } = require('./server.config');
const { sendMail } = require('../services/email.service');
const { errorResponse } = require('../utils/responseFormatter');
const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('.');
const { ErrorHandler } = require('../errors');

const connectRabitMQ = async () => {
  if (!RABBITMQ_SERVER_URL) {
    LoggerConfig.warn('RABBITMQ_SERVER_URL is not configured. Skipping RabbitMQ setup.');
    return false;
  }

  try {
    const connection = await amqplib.connect(RABBITMQ_SERVER_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('aeromind-notifications');
    channel.consume('aeromind-notifications', (data) => {
      try {
        const obj = JSON.parse(data.content.toString());
        sendMail(GMAIL_EMAIL, obj.recipientEmail, obj.subject, obj.text);
        channel.ack(data);
      } catch (consumerError) {
        LoggerConfig.error(`Error processing RabbitMQ message: ${consumerError.message}`);
        channel.nack(data, false, false);
      }
    });
    LoggerConfig.info('Connected to RabbitMQ and started consuming messages.');
    return true;
  } catch (error) {
    LoggerConfig.error(`Error while connecting the RabitMQ : ${error.message}`);
    return false;
  }
};

module.exports = { connectRabitMQ };
