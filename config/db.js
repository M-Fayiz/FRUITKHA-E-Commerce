const mongoose = require('mongoose');
require('dotenv').config()

const connectDB =async ()=>{
    try{
     const connect = await mongoose.connect(process.env.MONGO_URL);
     console.log('database connected ...',connect.connection.host);
     
    }catch(error){
        console.log('error in db connect',error.message);
        process.exit(1)
    }
}

module.exports = connectDB