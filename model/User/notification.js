const mongoose=require('mongoose')

const {ObjectId}=mongoose.Schema.Types

const Notification=mongoose.Schema({
    UserId:{type:ObjectId,ref:'user'},
    notification: [
        {
            message: { type: String, required: true },
            status: { type: String, default: 'info' },
            createdAt: { type: Date, default: Date.now },
        }]
},{Timestamp:true})

module.exports=mongoose.model('notifys',Notification)