const couponService = require('../services/couponService');
const { SuccessResponse, ErrorResponse } = require('../lib/apiResponse');
const {
  ValidationError,
  NotFoundError,
  CouponExpiredError,
  CouponConditionError,
  BadRequestError,
} = require('../lib/errors');

const couponController = {
  createCoupon: async (req, res, next) => {
    try {
      const coupon = await couponService.createCoupon(req.body);
      return new SuccessResponse(201, coupon).send(res);
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'MongoValidationError') {
        const details = error.details || Object.values(error.errors || {}).map((err) => err.message);
        return new ErrorResponse(400, 'Validation failed', details).send(res);
      }
      next(error);
    }
  },

  getAllCoupons: async (req, res, next) => {
    try {
      const coupons = await couponService.getAllCoupons();
      return new SuccessResponse(200, coupons).send(res);
    } catch (error) {
      next(error);
    }
  },

  getCouponById: async (req, res, next) => {
    try {
      const coupon = await couponService.getCouponById(req.params.id);
      return new SuccessResponse(200, coupon).send(res);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return new ErrorResponse(404, error.message).send(res);
      }
      next(error);
    }
  },

  updateCoupon: async (req, res, next) => {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      return new SuccessResponse(200, coupon).send(res);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return new ErrorResponse(404, error.message).send(res);
      } else if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map((err) => err.message);
        return new ErrorResponse(400, 'Validation failed', details).send(res);
      }
      next(error);
    }
  },

  deleteCoupon: async (req, res, next) => {
    try {
      const coupon = await couponService.deleteCoupon(req.params.id);
      return new SuccessResponse(200, { message: 'Coupon deleted', coupon }).send(res);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return new ErrorResponse(404, error.message).send(res);
      }
      next(error);
    }
  },

  getApplicableCoupons: async (req, res, next) => {
    try {
      if (!req.body.cart || !req.body.cart.items) {
        throw new BadRequestError('Invalid cart data');
      }
      const applicableCoupons = await couponService.getApplicableCoupons(req.body.cart);
      return new SuccessResponse(200, { applicable_coupons: applicableCoupons }).send(res);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return new ErrorResponse(400, error.message).send(res);
      }
      next(error);
    }
  },

  applyCoupon: async (req, res, next) => {
    try {
      if (!req.body.cart || !req.body.cart.items) {
        throw new BadRequestError('Invalid cart data');
      }
      const updatedCart = await couponService.applyCoupon(req.params.id, req.body.cart);
      return new SuccessResponse(200, { updated_cart: updatedCart }).send(res);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return new ErrorResponse(404, error.message).send(res);
      } else if (error instanceof CouponExpiredError) {
        return new ErrorResponse(400, error.message).send(res);
      } else if (error instanceof CouponConditionError) {
        return new ErrorResponse(400, error.message).send(res);
      } else if (error instanceof BadRequestError) {
        return new ErrorResponse(400, error.message).send(res);
      }
      next(error);
    }
  },
};

module.exports = couponController;