class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.info = message;
  }
}
module.exports = BaseError;
