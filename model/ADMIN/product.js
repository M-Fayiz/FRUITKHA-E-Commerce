const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema.Types
const productModel= new mongoose.Schema({
    productTitle:{
        type:String,
        requited:true
    },
    description:{
        type:String,
        required:true
    },
    RegulerPrice:{
        type:Number,
        required:true

    },
    OfferPrice:{
        type:Number,
        required:false
    },
    Stock:{
        type:Number,
        required:true
    },
   primaryImage:{
        type:String,
        required:true
    },
    additonalImage:{
         type:[String]
    }
    ,
    Category:{
        type:String,
        required:false
    },
    offerId:{
        type:ObjectId

    },
    ExpirAt:{
        type:Date,
        
    },
    isWishList:{
        type:Boolean,
        default:false
    },
    isList:{
        type:Boolean,
        default:true
    }

},{timestamps:true})

module.exports= mongoose.model('products',productModel)