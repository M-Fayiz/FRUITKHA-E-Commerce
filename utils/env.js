const dotenv=require('dotenv')

dotenv.config()

let envVariable={
    PORT:process.env.PORT,
    MONGO_URL:process.env.MONGO_URL,
GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET



}


module.exports=envVariable   