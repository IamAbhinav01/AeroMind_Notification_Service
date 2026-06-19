const express = require('express');
const {
  healthController,
  aeroplaneController,
  emailController,
} = require('../../controllers/');

const router = express.Router();

router.use('/healthy', healthController.health);
router.post('/tickets', emailController.createTickets);

module.exports = router;
