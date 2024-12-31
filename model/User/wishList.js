const mongoose=require('mongoose')
const{ObjectId}=mongoose.Schema.Types

const wishListSchema=mongoose.Schema({
    UserId:{
        type:ObjectId,
        ref:'user',
        required:true,
        
    },
    Products:[{
        product:{
        type:ObjectId,
        ref:'products',
        required:true
    } 
    }]
},{Timestamp:true})

module.exports=mongoose.model('wishList',wishListSchema)