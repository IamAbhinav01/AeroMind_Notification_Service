const { StatusCodes } = require('http-status-codes');
const LoggerConfig = require('../config/logger.config');
const ServerConfig = require('../config/server.config');
const { Resend } = require('resend');
const { ErrorHandler } = require('../errors');
const {
  SUCCESSS,
  PENDING,
  FAILED,
} = require('../utils/common/ticket-constants');
const { TicketRepository } = require('../repositories');

const resend = new Resend(ServerConfig.RESEND_API_KEY || process.env.RESEND_API_KEY);
const ticketRepository = new TicketRepository();

const sendMail = async (from, to, subject, text, html) => {
  try {
    const payload = {
      from: from,
      to: Array.isArray(to) ? to : [to],
      subject: subject || 'Hello World',
    };

    if (html) {
      payload.html = html;
    } else if (text) {
      payload.text = text;
    } else {
      payload.html = '<strong>It works!</strong>';
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error({ error });
      LoggerConfig.error(`Resend error: ${JSON.stringify(error)}`);
      throw new ErrorHandler(
        `Error sending email: ${error.message || JSON.stringify(error)}`,
        StatusCodes.BAD_REQUEST
      );
    }

    console.log({ data });
    LoggerConfig.info(`Email sent successfully via Resend: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    LoggerConfig.error(
      `error while sending the user the email: ${error.message}`,
      error.stack || error
    );
    throw new ErrorHandler(
      `Error occured while sending the user the email: ${error.message}`,
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
        ticketData.content,
        ticketData.html
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
