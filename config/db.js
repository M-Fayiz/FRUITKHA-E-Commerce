const mongoose = require('mongoose');
const {MONGO_URL} = require('../utils/env')
const connectDB =async ()=>{
    try{
     await mongoose.connect(MONGO_URL);
     console.log('success fully connected db');
     
    }catch(error){
        console.log('error in db connect',error.message);;
        process.exit(1)
    }
}

module.exports = connectDB