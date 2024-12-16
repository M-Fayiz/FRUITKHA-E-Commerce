require('dotenv').config()
const express=require('express')
const app=express()
const session=require('express-session')
let MongoStore = require('connect-mongo')
const path=require('path')


const passport=require('./config/passport')
const {startExpired,StockExpire,manageExpiration}=require('./utils/service/cron')
// const morgan=require('morgan')

const {PORT}=require('./utils/env')

// const mongoose=require('mongoose')
// mongoose.connect(MONGO_URL)

app.use('/images', express.static(path.join(__dirname, "IMAGES")))

app.use(session({
    secret:"mewo",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60*24
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL
    })
}))

const nocache=require('nocache')
app.use(nocache())

app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));
// app.use(morgan('common'))
app.use(express.static(path.join(__dirname, 'assets')));

app.use(passport.initialize())
app.use(passport.session())

const userRouter = require('./router/user')
const adminRouter=require('./router/admin')

app.use('/',userRouter)
app.use('/admin',adminRouter)

const connectDB = require('./config/db')
startExpired()
StockExpire();
manageExpiration()
app.listen(PORT,()=>{
    connectDB()
    console.log('_...,.,,., RUNNING......');
})

