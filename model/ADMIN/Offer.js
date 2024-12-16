const mongoose=require('mongoose')
const { ObjectId } = mongoose.Schema.Types; 
const PRODUCT=require('../../model/ADMIN/product')


const offer=new mongoose.Schema({

    offer:{
        type:Number,
    },
    productId:{
      type: ObjectId, 
      ref: 'products',
    },
    categoryId:{
        type: ObjectId, 
        ref: 'categories',
    },
    description:{
        type:String
    },
    CreatedAt:{
        type: Date,
        required:true
    },
    status:{ type: String, enum: ['Active', 'Expired'], default: 'Active' },
    expiredAt: {
        type: Date,
        required: true,
         
    }
})



module.exports=mongoose.model('Offer',offer)