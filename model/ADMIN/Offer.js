const mongoose=require('mongoose')
const { ObjectId } = mongoose.Schema.Types; 
const PRODUCT=require('../../model/ADMIN/product')


const offer=new mongoose.Schema({

    offer:{
        type:Number,
        
       
    },
    productName:{
        type:String
    },
    categoryName:{
        type: ObjectId, 
        ref: 'category', // Specify the related collection (Optional but recommended)
    },
    description:{
        type:String
    },
    CreatedAt:{
        type: Date,
        required:true
    },
    expiredAt: {
        type: Date,
        required: true,
        index: { expires: 0 },  
    }
})


offer.pre('remove', async function (next) {
    try {
      const offerId = this._id;
      
      await PRODUCT.updateMany(
        { offerId },
        { $unset: { OfferPrice: '', offerId: '' } } 
      );
  
      console.log(`Cleanup done for products linked to offerId: ${offerId}`);
      next();
    } catch (error) {
      console.error('Error during offer cleanup:', error.message);
      next(error);
    }
})
  
module.exports=mongoose.model('Offer',offer)