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
          image:{type:String},
          adminStatus:
          {
            status:{type:Boolean,default:false},
            response:{type:String,num:['Pending','Approved','Rejected'],
              default:'Pending'}
            
            
          }
         
        },
        // cancel:{
        //   req:{type:Boolean,default:false},
        //   reason:String,
        //   adminStatus:{
        //     type:Boolean,
        //     default:false
        //   }
          
        // },
        discountValue:{type:Number},
        refundAmound:{type:Number,default:0},
        status: {
          type: String,
          enum: ['Pending'  , 'Shipped','Out for Delivery', 'Delivered','Cancelled', 'Returned'],
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
    GST:{type:Number},
    Final_Amount: {
      type: Number,
      // required: true,
    },
     Return:{
      req:{type:Boolean,default:false},
      reason:{type:String},
      image:{type:String},
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
      enum: ['Pending', 'Completed', 'Refund','Failed'],
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
  this.GST=Math.round(0.12*subTotal)
  this.subTotal = subTotal;
  this.Final_Amount = this.subTotal + this.GST+this.Shipping - this.Coupon.discountValue;

  next();
});


module.exports = mongoose.model('order', orderSchema);
