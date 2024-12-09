const mongoose=require('mongoose')
const{ObjectId}=mongoose.Schema.Types

const address=mongoose.Schema({
       UserID:{
        type:ObjectId,
        required:true
       },
       Address_name:{
        type:String,
        required:true
       },
       Name:String,
       PIN:{
        type:Number,
        required:true
       },
       place:{
        type:String,
        required:true
       },
       mark:{
        type:String,
        required:true
       },
       District:{
        type:String,
        required:true
       },
       State:{
        type:String,
        required:true
       }
})

module.exports=mongoose.model('Address',address)