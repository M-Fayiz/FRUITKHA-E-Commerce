const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const CartSchema = new Schema(
  {
    UserID: {
      type: Types.ObjectId,
      ref: 'user',
      required: true,
    },
    Products: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'products',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1, 
        },
        Price: {
          type: Number,
          required: true,
          min: 0, 
        },
        TOTAL: {
          type: Number,
          default: 0,
        },
      },
    ],
    subTotal: {
      type: Number,
      default: 0,
    },
    Discount: {
      discount_amount: {
        type: Number,
        default: 0,
        min: 0, 
      },
      discountId: {
        type: Types.ObjectId,
        ref: 'coupons',
      },
    },
    Shipping: {
      type: Number,
      default: 40,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CartSchema.pre('save', function (next) {
  this.subTotal = this.Products.reduce((sum, product) => {
    return sum + product.quantity * product.Price;
  }, 0);
  next();
});

CartSchema.pre('save', function (next) {
  if (this.Discount.discount_amount > this.subTotal) {
    this.Discount.discount_amount = this.subTotal; 
  }
  next();
});

const CART = mongoose.model('carts', CartSchema);
module.exports = CART;
