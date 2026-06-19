const { StatusCodes } = require('http-status-codes');
const { LoggerConfig, NodeMailer, ServerConfig } = require('../config');
const { ErrorHandler } = require('../errors');
const {
  SUCCESSS,
  PENDING,
  FAILED,
} = require('../utils/common/ticket-constants');
const { TicketRepository } = require('../repositories');

const ticketRepository = new TicketRepository();

const sendMail = async (from, to, subject, text) => {
  try {
    const response = await NodeMailer.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: text,
    });
    console.log('Email send response : ', response);
    return response;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    LoggerConfig.error('error while sending  the user the email');
    throw new ErrorHandler(
      'Error occured while sending  the user the email',
      StatusCodes.BAD_REQUEST
    );
  }
};

const createTicket = async (data) => {
  try {
    const validStatus = [PENDING, SUCCESSS, FAILED];
    const recipientEmail = data.recipientEmail || data.recepientEmail;

    if (!recipientEmail) {
      throw new ErrorHandler(
        'recipientEmail is required',
        StatusCodes.BAD_REQUEST
      );
    }

    const ticketData = {
      subject: data.subject,
      content: data.content,
      recipientEmail,
      status: validStatus.includes(data.status) ? data.status : PENDING,
    };

    const response = await ticketRepository.create(ticketData);
    try {
      const mailResponse = await sendMail(
        ServerConfig.GMAIL_EMAIL,
        recipientEmail,
        ticketData.subject,
        ticketData.content
      );
      await ticketRepository.update(response.id, { status: SUCCESSS });
      LoggerConfig.info(
        'Successfully sent data to recipient and updated ticket status'
      );
      return { ticket: response, mailResponse };
    } catch (sendError) {
      await ticketRepository.update(response.id, { status: FAILED });
      LoggerConfig.error(
        'Failed to send email, ticket status updated to FAILED'
      );
      if (sendError instanceof ErrorHandler) {
        throw sendError;
      }
      throw sendError;
    }
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    LoggerConfig.error(
      `error occured while creating data to database ${error.message}`
    );
    throw new ErrorHandler(
      'Error occured while creating data to database',
      StatusCodes.BAD_REQUEST
    );
  }
};

const getPendingEmails = async () => {
  try {
    const response = await ticketRepository.getPendingTickets();
    LoggerConfig.info('Successfully fetched all the emails ');
    return response;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    LoggerConfig.error(
      `error occured while creating data to database ${error.message}`
    );
    throw new ErrorHandler(
      'Error occured while creating data to database',
      StatusCodes.BAD_REQUEST
    );
  }
};
module.exports = {
  sendMail,
  createTicket,
  getPendingEmails,
};
