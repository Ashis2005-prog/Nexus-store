const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      zip:     { type: String, required: true },
      country: { type: String, default: 'US' },
    },
    paymentMethod: {
      type: String,
      default: 'Card',
    },
    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    isPaid:     { type: Boolean, default: false },
    paidAt:     { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-calculate totals before save
orderSchema.pre('save', function (next) {
  this.itemsPrice    = this.items.reduce((s, i) => s + i.price * i.qty, 0);
  this.taxPrice      = parseFloat((this.itemsPrice * 0.08).toFixed(2));
  this.shippingPrice = this.itemsPrice > 100 ? 0 : 9.99;
  this.totalPrice    = parseFloat(
    (this.itemsPrice + this.taxPrice + this.shippingPrice).toFixed(2)
  );
  next();
});

module.exports = mongoose.model('Order', orderSchema);
