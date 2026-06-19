const express = require('express');
const { healthController, aeroplaneController } = require('../../controllers/');

const router = express.Router();

router.use('/healthy', healthController.health);

module.exports = router;
