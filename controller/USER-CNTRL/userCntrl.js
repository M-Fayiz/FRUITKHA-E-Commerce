const User=require('../../model/User/userModel')
const mailSender=require('../../utils/mail_sender')
const bcrypt=require('bcrypt')

const COUPON=require('../../model/ADMIN/Coupon')
const category=require('../../model/ADMIN/category')
const wishList=require('../../model/User/wishList')
const PRODUCT=require('../../model/ADMIN/product')
const OFFER=require('../../model/ADMIN/Offer')
const CART=require('../../model/User/CART')
const notify=require('../../model/User/notification')
const { success } = require('./CHECK-OUT')



const securePassword = async (password) => {
    try {
      const hashpassword = await bcrypt.hash(password, 10)
      return hashpassword
    } catch (error) {
      console.log(error)
    }
  }
  
// ||| OTP SECTION - OTP SECTION - OTP SECTION  |||

  const generateOTP= async(req,res)=>{
    try{
    const {firstName,lastName,email,phone,password}= req.body

    req.session.userData = {firstName,lastName,email,phone,password}
       console.log("userData",req.session.userData)

        const otp = Math.floor(Math.random()*(999999-111111+1))+111111
       req.session.otpDATA={otp,email,createdAt:Date.now}


       mailSender.sendMail(email,otp)

   
      console.log( 'otp data session',req.session.otpDATA)

      console.log('OTP sended :-',otp)

      res.json({success:true,message:`OTP Sent to ${email}` })
   
    
  }catch(err){
   console.log('error',err)
   res.json({success:false,message:err.message})
  }
  }

const resendOTP = async (req, res) => {
  console.log('- - GET IN RESEND OTP - -')
  try {
    const {otpDATA} = req.session
 console.log('otpDATA',otpDATA)
    if (!otpDATA || !otpDATA.email) {
      return res.json({ success: false, message: "OTP not found in session." })
    }

    const newOTP = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111  
    await mailSender.sendMail(otpDATA.email, newOTP)

    req.session.otpDATA.otp=newOTP
    req.session.otpDATA.createdAt=Date.now
   
    console.log('RESENT OTP IS :-',newOTP)
    res.json({ success: true, message: "OTP resent successfully" })
  } catch (err) {
    console.log("Error resending OTP:", err)
    res.json({ success: false, message: "Failed to resend OTP" })
  }
}

// || VERIFY OTP ||  VERIFY OTP ||  VERIFY OTP 

const verifyOTP = async (req, res) => {
  console.log("GET IN VERIFY OTP")

  try {
    const { otp, EMAIL } = req.body

  

    if (!otp || !EMAIL) {
      return res.status(400).json({ success: false, message: "OTP or Email not found." })
    }

    
    if (!req.session.otpDATA) {
      return res.status(404).json({ success: false, message: "No OTP session data found." })
    }

    const now = Date.now()
    const { otp: storedOTP, email: storedEmail, createdAt } = req.session.otpDATA

    
    if (now - createdAt > 5 * 60 * 1000) {
      req.session.otpDATA = null
      return res.status(410).json({ success: false, message: 'OTP Expired!' })
    }

   
    if (otp.toString() === storedOTP.toString() && EMAIL === storedEmail) {
      req.session.otpDATA = null 
    
      console.log('otp verified')
      
      const { firstName, lastName, email, phone, password } = req.session.userData
      const checkUser = await User.findOne({ email })
     

      if (checkUser) {
        return res.status(409).json({ success: false, message: "User already exists." })
      }

     
      const securepswrd = await securePassword(password)

      
      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        password: securepswrd,
        lastLogin: new Date()
      })

      const newResult = await newUser.save()
      req.session.user = newResult._id 

      console.log('USER SAVED')
      return res.status(200).json({ success: true, message: "User registered successfully." })
    } else {
      return res.status(404).json({ success: false, message: 'Invalid OTP or Email' })
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: 'Internal Error. Please try again later.' })
  }
}

const Login = async (req, res) => {
  console.log('GET IN LOGIN VERIFY')
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
  
    if (!user){
     return res.status(400).json({success: false, message: "invalid Email" }) 
    }
    if(user.isGoogle===true){
      return res.status(400).json({success:false,message:'user loged with google, please login with google'})
    }
    
    if(user.isActive===false){
    return  res.json({success:false,message:"you have been blocked for some reason"})
    }
    
    const ismatch = await bcrypt.compare(password, user.password)
    if (!ismatch){

      return res.json({success: false, message: "Password not Match"}) 
    }  

    req.session.user = user._id  
    User.updateOne({email},{lastLogin:new Date()})


     res.status(200).json({ success: true, message: "User Login successfully." })
    
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })  
  }
}

const logOut=(req,res)=>{
   console.log('get in logOut')
  // console.log(req.params.id)
//  console.log(req.session.user)
  req.session.user=null
  res.redirect('/')
}


const loadSignUp=(req,res)=>{
    res.render('user/signup')
}

const about=(req,res)=>{
  res.render('user/about')
}

const LoadHome=async(req,res)=>{
  console.log('log home')
  
  try {

     const NOtify=await notify.findOne({UserId:req.session.user})
  
    const Data=await category.find({isList:true})

    const coupon=await COUPON.find({status:'Active'})
    res.render('user/index',{Data,user: req.session.user,CURRENTpage:'Home',Category:null,coupon,NOtify})  
  } catch (error) {
    console.log("from home error",error)
    
  }
  
}


const Loadotp=(req,res)=>{
  const Email=req.session.otpDATA.email
    console.log(Email,'/../')
  res.render('user/otp',{email:Email})
  
}

const getlogin=(req,res)=>{
  res.render('user/login')
}



const Reset=(req,res)=>{
  res.render('user/forgot')
}

const email=(req,res)=>{
  res.render('user/email')
}

const shop = async (req, res) => {

  const NOtify=await notify.findOne({UserId:req.session.user}).sort({createdAt:-1})

  const cart = await CART.aggregate([
    { $match: { UserID: req.session.user } },
    { $project: { totalProject: { $size: "$Products" } } }
  ]);
  

  const totalProject = cart[0] ? cart[0].totalProject : 0;

  try {
      
      const Category = req.query.category
      const cattt=req.query.Category
      const page = parseInt(req.query.page) || 1 
      const limit = 6 
      const skip = (page - 1) * limit 
      let message = ''

      
      const listedCategory = await category.find({ isList: true })
      const listedCategoryNames = listedCategory.map(cat => cat.category)

     
      let query = { isList: true } 
      if (Category||cattt) {
          
          if (listedCategoryNames.includes(Category)) {
              query.Category = Category
          } 
      } else {
         
          query.Category = { $in: listedCategoryNames }
      }

      const current=new Date()
      const activeOffers = await OFFER.find({
        status: 'Active',
        CreatedAt: { $lte: current },
        expiredAt: { $gte: current }  
    }).select('_id'); 
    const offerIds = activeOffers.map(offer => offer._id);
    

      const products = await PRODUCT.find(query).skip(skip).limit(limit).populate({
        path: 'Offer.OfferId',
        match: { _id: { $in: offerIds } } 
    })
    const product = await PRODUCT.find()
   

      if (products.length === 0) {
          message = message || 'No products found.'
      }

      const totalProducts = await PRODUCT.countDocuments(query)
      const totalPages = Math.ceil(totalProducts / limit)
 
      if (page > totalPages && totalProducts > 0) {
          return res.redirect(`/user/shop?page=${totalPages}`)
      }
    const userId=req.session.user
console.log(userId)
const whishlist=await wishList({UserId:userId})
console.log(whishlist.Products,'kkk')
      const heart = await PRODUCT.aggregate([
        {
          $lookup: {
            from: 'wishlists', 
            let: { productId: "$_id" },
            pipeline: [
              { $match: { $expr: { $and: [ { $eq: ["$UserId", userId] }, { $in: ["$$productId", "$Products.product"] } ] } } }
            ],
            as: "wishlistMatch"
          }
        },
        {
          $addFields: {
            isInWishlist: { $gt: [{ $size: "$wishlistMatch" }, 0] } 
          }
        },
        {
          $project: {
            _id: 1,
            
            isInWishlist: 1
          }
        }
      ]);
      
      console.log(heart,'heart');
      
     const data=await category.find({isList:true})
     const coupon=await COUPON.find({status:'Active'})
   
      res.render('user/shop', {
          products,
          user: req.session.user,
          message,
          listedCategory,
          currentPage: page,
          totalPages,
          CURRENTpage:'shop',
          Category:req.query.category,
          data,
          coupon,
          totalProject,
          NOtify
          
      })
      
  } catch (error) {
      console.error('Error fetching products:', error)
      res.status(500).json({
          success: false,
          message: 'An error occurred while fetching products.',
          error: error.message, 
      })
  }
}

// ** SEARCH - SEARCH - SEARCH - SEARCH
const search = async (req, res) => {
  const searchQuery = req.query.search ? req.query.search.toLowerCase() : ''
  const selectedCategories = req.query.selectedCategories || ''
  const priceRange = req.query.priceRange || ''
  const sortOrder = req.query.sortOrder || '' 
  const page = parseInt(req.query.page) || 1 
  const limit = 6 
  const skip = (page - 1) * limit 
  // let message = ''

  let query = { isList: true }

  try {
    const cat = await category.find({ isList: true })
    const listedCategoryNames = cat.map(cat => cat.category)

    if (searchQuery) {
      let regex = new RegExp(`^${searchQuery}`, "i")
      if (listedCategoryNames.some(category => new RegExp(`^${searchQuery}$`, 'i').test(category))) {
        query.Category = { $regex: searchQuery, $options: 'i' }
      } else {
        query = {
          isList: true,
          $or: [
            { productTitle: { $regex: searchQuery, $options: 'i' } },
            { Category: { $regex: searchQuery, $options: 'i' } },
            { Brand: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      }
    } else {
      query.Category = { $in: listedCategoryNames }
    }

    if (selectedCategories) {
      const selectedCategoryArray = selectedCategories.split(',')
      query.Category = { $in: selectedCategoryArray }
    }

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number)
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.Price = { $gte: minPrice, $lte: maxPrice }
      }
    }

    
    let sortCriteria = {}

    switch (sortOrder) {
      case 'LOW':
        sortCriteria.RegulerPrice = 1  
      case 'HIGH':
        sortCriteria.RegulerPrice = -1 
        break
      case 'NEWEST':
        sortCriteria.createdAt = -1    
        break
      case 'A_TO_Z':
        sortCriteria.productTitle = 1          
        break
      case 'Z_TO_A':
        sortCriteria.productTitle = -1         
        break
      // case 'POPULARITY':
      //   sortCriteria.popularity = -1   
      //   break
      default:
        console.log('Invalid sort order') 
    }

    const products = await PRODUCT.find(query).sort(sortCriteria).skip(skip).limit(limit)
    const totalProducts = await PRODUCT.countDocuments(query)

      const totalPages = Math.ceil(totalProducts / limit)

      
      if (page > totalPages && totalProducts > 0) {
          return res.redirect(`/user/shop?page=${totalPages}`)
      }

    if (products.length === 0) {
        message = message || 'No products found.'
    }

    if (!products || products.length === 0) {
      return res.json({ message: "No products found" })
    }

    res.json(products)

  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Error fetching products', error: error.message })
  }
}


// ///// Realated product 
const productId=async(req,res)=>{
  const productId=req.params.id
 
  console.log('^ ^ GET IN PRODUCT DETAILS ^^')
  try {

    const item=await PRODUCT.findById(productId)

    const NOtify=await notify.findOne({UserId:req.session.user})
    const related=await PRODUCT.find({
      Category:item.Category,
      _id:{
          $ne:productId
      }
  }).limit(4)


  
  const cat=await category.findOne({category:item.Category})
  
  const coupon=await COUPON.find({status:'Active'})
    res.render('user/single-product',{item,user: req.session.user,related,CURRENTpage:'product',cat ,Category:item.Category,coupon,NOtify})
  } catch (error) {
    console.log(error)
  }
}

const ALL = async (req, res) => {
  console.log('Fetching products for shop page...')

  try {
    console.log('GET IN SEARCH')
    
    const Category = req.query.category
    const page = parseInt(req.query.page) || 1
    const limit = 6 
    const skip = (page - 1) * limit 
    let message = ''

    const listedCategory = await category.find({ isList: true })
    const listedCategoryNames = listedCategory.map(cat => cat.category)

   
    let query = { isList: true }
    if (Category) {
      if (listedCategoryNames.includes(Category)) {
        query.Category = Category
      }
    } else {
      query.Category = { $in: listedCategoryNames }
    }

  
    const products = await PRODUCT.find(query).skip(skip).limit(limit)
    const totalProducts = await PRODUCT.countDocuments(query)
    const totalPages = Math.ceil(totalProducts / limit)

 
    if (products.length === 0) {
      message = 'No products found.'
    }

   
    res.json({
      success: true,
      products,
      message: message || 'Products fetched successfully.',
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
      listedCategory, 
      selectedCategory: Category || null,
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching products.',
      error: error.message, 
    })
  }
}

const contact=(req,res)=>{
  res.render('user/contact')
}

module.exports={
    loadSignUp,
    // registration,
    LoadHome,
    generateOTP,
    Loadotp,
    resendOTP,
    verifyOTP,
    Login,
    getlogin,
    Reset,
    email,
    shop,
    // singleProduct,
    productId,
    logOut,
    search,
    ALL,
    about,
    contact
    
   
   
  

}