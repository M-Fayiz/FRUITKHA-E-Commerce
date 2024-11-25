
const mongoose=require('mongoose')


const AdminModel=new mongoose.Schema({
    Name:{
        type:String,
        required:true
    }
    ,email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    Admin_status:{
        type:String,
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model('admins',AdminModel)


