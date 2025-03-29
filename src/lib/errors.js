class ValidationError extends Error {
    constructor(message, details) {
      super(message);
      this.name = 'ValidationError';
      this.details = details;
    }
  }
  
  class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
      super(message);
      this.name = 'NotFoundError';
    }
  }
  
  class CouponExpiredError extends Error {
    constructor(message = 'Coupon has expired') {
      super(message);
      this.name = 'CouponExpiredError';
    }
  }
  
  class CouponConditionError extends Error {
    constructor(message = 'Coupon conditions not met') {
      super(message);
      this.name = 'CouponConditionError';
    }
  }
  
  class BadRequestError extends Error {
    constructor(message = 'Bad request') {
      super(message);
      this.name = 'BadRequestError';
    }
  }
  
  module.exports = {
    ValidationError,
    NotFoundError,
    CouponExpiredError,
    CouponConditionError,
    BadRequestError,
  };