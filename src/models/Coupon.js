const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  type: { type: String, enum: ['cart-wise', 'product-wise', 'bxgy'], required: true },
  details: {
    threshold: { type: Number }, // For cart-wise
    discount: { type: Number}, // Percentage or fixed discount
    product_id: { type: Number }, // For product-wise
    buy_products: [{ product_id: Number, quantity: Number }], // For BxGy
    get_products: [{ product_id: Number, quantity: Number }], // For BxGy
    repetition_limit: { type: Number, default: 1 }, // For BxGy
  },
  expiration_date: { type: Date }, // Bonus: Expiration date
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', couponSchema);