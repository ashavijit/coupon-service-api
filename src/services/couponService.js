const Coupon = require('../models/Coupon');
const cache = require('../utils/redisCache');
const { NotFoundError, CouponExpiredError, CouponConditionError } = require('../lib/errors');

class CouponService {
  async createCoupon(data) {
    const coupon = new Coupon(data);
    await coupon.save();
    await cache.del('coupons'); // Invalidate cache
    return coupon;
  }

  async getAllCoupons() {
    const cached = await cache.get('coupons');
    if (cached) return cached;

    const coupons = await Coupon.find();
    await cache.set('coupons', coupons);
    return coupons;
  }

  async getCouponById(id) {
    const cached = await cache.get(`coupon:${id}`);
    if (cached) return cached;

    const coupon = await Coupon.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    await cache.set(`coupon:${id}`, coupon);
    return coupon;
  }

  async updateCoupon(id, data) {
    const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
    if (!coupon) throw new NotFoundError('Coupon not found');
    await cache.set(`coupon:${id}`, coupon);
    await cache.del('coupons');
    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    await cache.del(`coupon:${id}`);
    await cache.del('coupons');
    return coupon;
  }

  async getApplicableCoupons(cart) {
    const coupons = await this.getAllCoupons();
    const applicableCoupons = [];

    for (const coupon of coupons) {
      if (coupon.expiration_date && new Date() > coupon.expiration_date) continue;

      const discount = this.calculateDiscount(coupon, cart);
      if (discount > 0) {
        applicableCoupons.push({
          coupon_id: coupon._id,
          type: coupon.type,
          discount,
        });
      }
    }
    return applicableCoupons;
  }

  async applyCoupon(id, cart) {
    const coupon = await this.getCouponById(id);
    if (coupon.expiration_date && new Date() > coupon.expiration_date) {
      throw new CouponExpiredError('Coupon has expired');
    }

    const discount = this.calculateDiscount(coupon, cart);
    if (discount === 0) {
      throw new CouponConditionError('Coupon conditions not met');
    }

    const updatedCart = this.applyDiscountToCart(coupon, cart, discount);
    return updatedCart;
  }

  calculateDiscount(coupon, cart) {
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    switch (coupon.type) {
      case 'cart-wise':
        return total > coupon.details.threshold ? (total * coupon.details.discount) / 100 : 0;

      case 'product-wise':
        const product = cart.items.find((item) => item.product_id === coupon.details.product_id);
        return product ? (product.price * product.quantity * coupon.details.discount) / 100 : 0;

      case 'bxgy':
        const buyCount = this.countMatchingItems(cart.items, coupon.details.buy_products);
        const getCount = this.countMatchingItems(cart.items, coupon.details.get_products);
        const timesApplicable = Math.min(
          Math.floor(buyCount / coupon.details.buy_products[0].quantity),
          coupon.details.repetition_limit
        );
        const freeItems = Math.min(timesApplicable, getCount);
        return freeItems * coupon.details.get_products[0].quantity * cart.items.find(
          (item) => item.product_id === coupon.details.get_products[0].product_id
        )?.price || 0;

      default:
        return 0;
    }
  }

  countMatchingItems(cartItems, products) {
    return cartItems.reduce((count, item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      return product ? count + item.quantity : count;
    }, 0);
  }

  applyDiscountToCart(coupon, cart, discount) {
    const updatedCart = { ...cart, total_discount: discount, total_price: 0, final_price: 0 };
    updatedCart.items = cart.items.map((item) => ({ ...item, total_discount: 0 }));

    if (coupon.type === 'cart-wise') {
      updatedCart.total_price = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      updatedCart.final_price = updatedCart.total_price - discount;
    } else if (coupon.type === 'product-wise') {
      updatedCart.items = cart.items.map((item) => {
        if (item.product_id === coupon.details.product_id) {
          item.total_discount = (item.price * item.quantity * coupon.details.discount) / 100;
        }
        return item;
      });
      updatedCart.total_price = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      updatedCart.final_price = updatedCart.total_price - discount;
    } else if (coupon.type === 'bxgy') {
      const freeItems = this.countMatchingItems(cart.items, coupon.details.get_products);
      updatedCart.items = cart.items.map((item) => {
        if (coupon.details.get_products.some((p) => p.product_id === item.product_id)) {
          item.total_discount = Math.min(freeItems, item.quantity) * item.price;
        }
        return item;
      });
      updatedCart.total_price = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      updatedCart.final_price = updatedCart.total_price - discount;
    }

    return updatedCart;
  }
}

module.exports = new CouponService();