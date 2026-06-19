const { CrudRepository } = require('./crudOperations.repository');
const { Ticket } = require('../models');
const { where } = require('sequelize');
const { PENDING } = require('../utils/common/ticket-constants');

class TicketRepository extends CrudRepository {
  constructor() {
    super(Ticket);
  }
  async getPendingTickets() {
    const response = await Ticket.findAll({
      where: {
        status: PENDING,
      },
    });
    return response;
  }
}
module.exports = TicketRepository;
