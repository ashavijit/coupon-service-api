const couponService = require('../services/couponService');

// Helper function to format error responses
const formatErrorResponse = (res, status, message, details = null) => {
  const response = { success: false, error: { message } };
  if (details) response.error.details = details;
  return res.status(status).json(response);
};

// Helper function to format success responses
const formatSuccessResponse = (res, status, data) => {
  return res.status(status).json({ success: true, data });
};

const couponController = {
  createCoupon: async (req, res, next) => {
    try {
      const coupon = await couponService.createCoupon(req.body);
      formatSuccessResponse(res, 201, coupon);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Handle Mongoose validation errors
        const errors = Object.values(error.errors).map((err) => err.message);
        formatErrorResponse(res, 400, 'Validation failed', errors);
      } else {
        next(error); // Pass unexpected errors to the global error handler
      }
    }
  },

  getAllCoupons: async (req, res, next) => {
    try {
      const coupons = await couponService.getAllCoupons();
      formatSuccessResponse(res, 200, coupons);
    } catch (error) {
      next(error); 
    }
  },

  getCouponById: async (req, res, next) => {
    try {
      const coupon = await couponService.getCouponById(req.params.id);
      formatSuccessResponse(res, 200, coupon);
    } catch (error) {
      if (error.message === 'Coupon not found') {
        formatErrorResponse(res, 404, 'Coupon not found');
      } else {
        next(error);
      }
    }
  },

  updateCoupon: async (req, res, next) => {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      formatSuccessResponse(res, 200, coupon);
    } catch (error) {
      if (error.message === 'Coupon not found') {
        formatErrorResponse(res, 404, 'Coupon not found');
      } else if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => err.message);
        formatErrorResponse(res, 400, 'Validation failed', errors);
      } else {
        next(error);
      }
    }
  },

  deleteCoupon: async (req, res, next) => {
    try {
      const coupon = await couponService.deleteCoupon(req.params.id);
      formatSuccessResponse(res, 200, { message: 'Coupon deleted', coupon });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        formatErrorResponse(res, 404, 'Coupon not found');
      } else {
        next(error);
      }
    }
  },

  getApplicableCoupons: async (req, res, next) => {
    try {
      if (!req.body.cart || !req.body.cart.items) {
        return formatErrorResponse(res, 400, 'Invalid cart data');
      }
      const applicableCoupons = await couponService.getApplicableCoupons(req.body.cart);
      formatSuccessResponse(res, 200, { applicable_coupons: applicableCoupons });
    } catch (error) {
      next(error);
    }
  },

  applyCoupon: async (req, res, next) => {
    try {
      if (!req.body.cart || !req.body.cart.items) {
        return formatErrorResponse(res, 400, 'Invalid cart data');
      }
      const updatedCart = await couponService.applyCoupon(req.params.id, req.body.cart);
      formatSuccessResponse(res, 200, { updated_cart: updatedCart });
    } catch (error) {
      if (error.message === 'Coupon not found') {
        formatErrorResponse(res, 404, 'Coupon not found');
      } else if (error.message === 'Coupon expired') {
        formatErrorResponse(res, 400, 'Coupon has expired');
      } else if (error.message === 'Coupon conditions not met') {
        formatErrorResponse(res, 400, 'Coupon conditions not met');
      } else {
        next(error);
      }
    }
  },
};

module.exports = couponController;