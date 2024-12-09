const mongoose=require('mongoose')
const { ObjectId } = mongoose.Schema.Types;
const TOKEN=mongoose.Schema({
    userID:{
        type:ObjectId,
        required:true
    },
    token:{
        type:String,
        required:true
    },
    createdAT:{
        type: Date,
        default: Date.now,
        expires: 3600,
    }
})

module.exports=mongoose.model('Tokens',TOKEN)