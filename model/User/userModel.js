const mongoose=require('mongoose')
const{ObjectId}=mongoose.Schema.Types

const userSchema= mongoose.Schema({
    firstName:{
            type:String,
            required:true
    },
    lastName:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:false,
        sparse:true,
        default:null
    },
    googleId:{
        type:String,
        default: null,
    },
    password:{
        type:String,
        required:false
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true
    },
    lastLogin:{
        type:Date,
        required:true
    },
    isGoogle:{
        type:Boolean,
        default:false
    },
    usedCoupon:[{
       
        usageCount:{type:Number,required:true},
        coupon:{type:ObjectId}
    }]
},{timestamps:true})

module.exports=mongoose.model('user',userSchema)