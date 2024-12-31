const mongoose = require('mongoose');
const {MONGO_URL} = require('../utils/env')


const connectDB =async ()=>{
    try{
     const connect = await mongoose.connect(MONGO_URL);
     console.log('database succesfully connected ',connect.connection.host);
     
    }catch(error){
        console.log('error in db connect',error.message);;
        process.exit(1)
    }
}

module.exports = connectDB