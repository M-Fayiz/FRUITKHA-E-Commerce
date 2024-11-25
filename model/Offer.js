const mongoose=require('mongoose')
const { ObjectId } = mongoose.Schema.Types; //


const offer=new mongoose.Schema({

    offer:{
        type:Number,
        
       
    },
    productName:{
        type:String
    },
    categoryName:{
        type: ObjectId, // Reference to another collection
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

module.exports=mongoose.model('Offer',offer)