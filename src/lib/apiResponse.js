class ApiResponse {
    constructor(success, statusCode, data = null, error = null) {
      this.success = success;
      this.statusCode = statusCode;
      if (data) this.data = data;
      if (error) this.error = error;
    }
  
    send(res) {
      return res.status(this.statusCode).json(this);
    }
  }
  
  class SuccessResponse extends ApiResponse {
    constructor(statusCode, data) {
      super(true, statusCode, data);
    }
  }
  
  class ErrorResponse extends ApiResponse {
    constructor(statusCode, message, details = null) {
      super(false, statusCode, null, { message });
      if (details) this.error.details = details;
    }
  }
  
  module.exports = { SuccessResponse, ErrorResponse };