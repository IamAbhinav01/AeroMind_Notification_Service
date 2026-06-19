const amqplib = require('amqplib');
const { RABBITMQ_SERVER_URL, GMAIL_EMAIL } = require('./server.config');
const { sendMail } = require('../services/email.service');
const { errorResponse } = require('../utils/responseFormatter');
const { StatusCodes } = require('http-status-codes');
const LoggerConfig = require('./logger.config');
const { ErrorHandler } = require('../errors');

const connectRabitMQ = async () => {
  if (!RABBITMQ_SERVER_URL) {
    LoggerConfig.warn(
      'RABBITMQ_SERVER_URL is not configured. Skipping RabbitMQ setup.'
    );
    return false;
  }

  try {
    const connection = await amqplib.connect(RABBITMQ_SERVER_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('aeromind-notifications');
    channel.consume('aeromind-notifications', async (data) => {
      try {
        const obj = JSON.parse(data.content.toString());
        const recipientEmail = obj.recipientEmail || obj.recepientEmail;

        if (!recipientEmail) {
          LoggerConfig.error(
            `RabbitMQ message missing recipientEmail: ${JSON.stringify(obj)}`
          );
          channel.nack(data, false, false);
          return;
        }

        await sendMail(GMAIL_EMAIL, recipientEmail, obj.subject, obj.text, obj.html);
        channel.ack(data);
      } catch (consumerError) {
        LoggerConfig.error(
          `Error processing RabbitMQ message: ${consumerError.message}`
        );
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
