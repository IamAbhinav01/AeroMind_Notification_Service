const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config');
const { sucessResponse, errorResponse } = require('../utils/responseFormatter');
const { EmailService } = require('../services');

async function createTickets(req, res) {
  try {
    const response = await EmailService.createTicket({
      subject: req.body.subject,
      content: req.body.text || req.body.content,
      recipientEmail: req.body.recipientEmail || req.body.recepientEmail,
    });
    LoggerConfig.info('Ticket request obtained');
    return res.status(StatusCodes.ACCEPTED).json({
      ...sucessResponse,
      message: 'Successfully Ticket request obtained',
      data: response,
    });
  } catch (error) {
    LoggerConfig.error(`Error while  Generating the ticket : ${error.message}`);

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        ...errorResponse,
        message: error.message || 'Something went wrong',
        error: error,
      });
  }
}

async function getPendingTickets(req, res) {
  try {
    const response = await EmailService.getPendingEmails();
    LoggerConfig.info('Pending ticket request obtained');
    return res.status(StatusCodes.OK).json({
      ...sucessResponse,
      message: 'Successfully fetched pending tickets',
      data: response,
    });
  } catch (error) {
    LoggerConfig.error(`Error while fetching pending tickets : ${error.message}`);

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        ...errorResponse,
        message: error.message || 'Something went wrong',
        error: error,
      });
  }
}

module.exports = { createTickets, getPendingTickets };
