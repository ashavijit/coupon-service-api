const { ErrorResponse } = require('../lib/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  return new ErrorResponse(500, 'Internal server error', err.message).send(res);
};

module.exports = errorHandler;