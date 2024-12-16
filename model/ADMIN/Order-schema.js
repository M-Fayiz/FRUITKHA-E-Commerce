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
        },
        return:{
          req:{type:Boolean,default:false},
          reason:String,
          adminStatus:
          {
            status:{type:Boolean,default:false},
            response:{type:String,num:['Pending','Approved','Rejected'],
              default:'Pending'}
            
            
          }
         
        },
        cancel:{
          req:{type:Boolean,default:false},
          reason:String,
          adminStatus:{
            type:Boolean,
            default:false
          }
          
        },
        refundAmound:{type:Number,default:0},
        status: {
          type: String,
          enum: ['Pending'  , 'Shipped','Out for Delivery', 'Delivered','Cancelled', 'Returned'],
          default: 'Pending',
        },
        deliveryDate:{type:Date},
        expiryDate: { 
          type: Date,
      
        }
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
     Return:{
      req:{type:Boolean,default:false},
      reason:{type:String},
      admin:{
        status:{type:Boolean,default:false},
        response:{type:String,
        enum:['Pending','Approved','Rejected'],
        default:'Pending'
        }
      }
     },
     Datess:{
      DeliveryDate:{type:Date},
      expiryDate: { 
        type: Date, 
     }
    },
    orderStatus: {
      type: String,
      enum: ['Pending'  , 'Shipped','Out for Delivery', 'Delivered','Cancelled', 'Returned'],
      default: 'Pending',
    },
    payment: {
      type: String,
      enum: ['wallet', 'COD', 'razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Refunded'],
      default: 'Pending',
    },
    RazorPay:{
       razorpay_order_id :{type:String},
       razorpay_payment_id:{ type:String},
       razorpay_signature: { type: String },
 
    },
    Request:{
       reqstStatus:{
        Cancel:{type:Boolean,default:false},
        Return:{type:Boolean,default:false},
       },
       reason:{type:String},
       admin:{
        status:{type:Boolean,default:false},
        response:{type:String,
        enum:['Pending','Approved','Rejected'],
        default:'Pending'
        }
      }
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

orderSchema.methods.calculateRefundAndAdjustments = function (productToCancel) {
  const initialSubTotal = this.subTotal;
  const initialDiscount = this.Coupon.discountValue;


  const productDiscountShare = Math.round((initialDiscount / initialSubTotal) * productToCancel.TOTAL);


  const refundAmount = productToCancel.TOTAL - productDiscountShare;
  const floor = Math.round(refundAmount);


  this.subTotal = Math.round(this.subTotal - productToCancel.TOTAL);
  this.Coupon.discountValue = Math.round(this.Coupon.discountValue - productDiscountShare);


  this.subTotal = Math.max(0, this.subTotal);
  this.Coupon.discountValue = Math.max(0, this.Coupon.discountValue);


  this.Final_Amount = Math.round(this.subTotal + this.Shipping - this.Coupon.discountValue);

  return {
    success: true,
    floor,
    remainingSubTotal: this.subTotal,
    remainingDiscount: this.Coupon.discountValue,
    finalAmount: this.Final_Amount,
  };
};

orderSchema.pre('save', function (next) {
  let subTotal = 0;
  this.Products.forEach((product) => {
    if (product.status !== 'Cancelled'&& product.status!=='Returned') {
      product.TOTAL = product.Price * product.quantity;
      subTotal += product.TOTAL;
    }
  })
  const allProductsReturned = this.Products.every((product) => product.status === 'Returned' )
  if(allProductsReturned){
    order.orderStatus = 'Returned';
    order.Shipping = 0; 
   
  }
  this.subTotal = subTotal;
  this.Final_Amount = this.subTotal + this.Shipping - this.Coupon.discountValue;

  next();
});


module.exports = mongoose.model('order', orderSchema);
