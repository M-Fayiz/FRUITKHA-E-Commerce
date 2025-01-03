const mongoose=require('mongoose')
const CouponSchema=mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    Description:{
        type:String
    },
    Type:{
        type:String,
        enum:['Percentage','Fixed','shipping_Offer'],
        required:true
    },
    Value:{
        type:Number,
        // required:true
    },
    startDate:{
        type:Date,
        required:true
    },

    endDate:{
        type:Date,
        required:true
    },
    maxDiscount:Number,
    maxUses:{
        type:Number,
        default:0
    },
    Uses:{
        type:Number,
        default:0
    },
    usedPerUser:{
        type:Number,
        default:1
    },
    
    minCartValue:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:['Active','Expired','Disabled'],
        default:'Active'
    }
},{Timestamp:true})

module.exports=mongoose.model('Coupon',CouponSchema)