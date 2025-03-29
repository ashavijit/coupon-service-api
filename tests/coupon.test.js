const mongoose = require('mongoose');
const couponService = require('../src/services/couponService');

describe('Coupon Service', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a cart-wise coupon', async () => {
    const data = {
      type: 'cart-wise',
      details: { threshold: 100, discount: 10 },
    };
    const coupon = await couponService.createCoupon(data);
    expect(coupon.type).toBe('cart-wise');
    expect(coupon.details.discount).toBe(10);
  });

  it('should calculate discount for cart-wise coupon', async () => {
    const cart = {
      items: [{ product_id: 1, quantity: 2, price: 60 }],
    };
    const coupon = { type: 'cart-wise', details: { threshold: 100, discount: 10 } };
    const discount = couponService.calculateDiscount(coupon, cart);
    expect(discount).toBe(12); 
  });
});