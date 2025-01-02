const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const stockSchema = new mongoose.Schema({
  batchId: {
    type: String, 
    required: true,
  },
  quantity: {
    type: Number, 
    required: true,
  },
  expiryDate: {
    type: Date, 
    required: true,
  },
  isExpired: {
    type: Boolean, 
    default: false,
  },
});

const productModel = new mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    RegulerPrice: {
      type: Number,
      required: true,
    },
    Offer: {
         OfferPrice:Number,
         OfferId:ObjectId
    },
    Stock: [stockSchema], 
    totalStock:{type:Number,default:0},
    primaryImage: {
      type: String,
      required: true,
    },
    additonalImage: {
      type: [String],
    },
    Category: {
      type: ObjectId,
      ref:'categories',
      required: false,
    },
   
    // expiresAt: {
    //   type: Date, 
    // },
  
    isList: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productModel.virtual("expiredQuantity").get(function () {
    return this.Stock.reduce((acc, batch) => (batch.isExpired ? acc + batch.quantity : acc), 0);
  });

  
  productModel.set("toJSON", { virtuals: true });
  productModel.set("toObject", { virtuals: true });

module.exports = mongoose.model('products', productModel);
