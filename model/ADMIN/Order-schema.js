const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const orderSchema = new mongoose.Schema(
  {
    UserID: {
      type: ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    Products: [
      {
        product: {
          type: ObjectId,
          ref: 'products',
          required: true,
        },
        Name: String,
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
        Price: {
          type: Number,
          required: true,
        },
        TOTAL: {
          type: Number,
          // required: true,
        },
        status: {
          type: String,
          enum: ['Pending', 'Shipped', 'On Delivery', 'Delivered', 'Cancelled', 'Returned'],
          default: 'Pending',
        },
      },
    ],
    subTotal: {
      type: Number,
      default: 0,
    },
    Shipping: {
      type: Number,
      default: 40,
    },
    Coupon: {
      couponId: { type: ObjectId },
      code: { type: String },
      discountValue: { type: Number, default: 0 },
    },
    Final_Amount: {
      type: Number,
      // required: true,
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Cancelled', 'Completed', 'Confirmed', 'Shipped', 'Delivered', 'Returned'],
      default: 'Pending',
    },
    payment: {
      type: String,
      enum: ['wallet', 'COD', 'online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    addressId: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', async function (next) {
  let subTotal = 0;

  this.Products.forEach((product) => {
    if (product.status !== 'Cancelled') {
      product.TOTAL = product.Price * product.quantity; 
      subTotal += product.TOTAL; 
    }
  });

  this.subTotal = subTotal;
  this.Final_Amount = this.subTotal + this.Shipping - (this.Coupon.discountValue || 0);

  next();
});

module.exports = mongoose.model('order', orderSchema);
