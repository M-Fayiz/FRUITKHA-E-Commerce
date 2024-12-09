const mongoose=require('mongoose')

const Brand=new mongoose({
    Name:{
        type:String,
        required:true,
    },
    Image:{
        type:String,
        required:false
    }
})

module.exports=mongoose.model('Brand',(Brand))