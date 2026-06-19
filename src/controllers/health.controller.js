const { StatusCodes } = require('http-status-codes');

const health = (req, res) => {
  console.log(`The response was healthy.`);
  return res.status(StatusCodes.ACCEPTED).json({
    message: 'The response was healthy.',
    data: {},
    success: true,
  });
};

module.exports = { health };
