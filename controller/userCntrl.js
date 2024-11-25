const User=require('../model/userModel')
const mailSender=require('../utils/mail_sender')
const bcrypt=require('bcrypt')
const otpModel=require('../model/otp_Model');

const category=require('../model/category')

const PRODUCT=require('../model/product')

const mongoose=require('mongoose');
const { json } = require('express');




const securePassword = async (password) => {
    try {
      const hashpassword = await bcrypt.hash(password, 10);
      return hashpassword;
    } catch (error) {
      console.log(error);
    }
  };
  




  const generateOTP= async(req,res)=>{
    try{
    const {firstName,lastName,email,phone,password}= req.body;

    req.session.userData = {firstName,lastName,email,phone,password};
console.log("userData",req.session.userData);

    const otp = Math.floor(Math.random()*(999999-111111+1))+111111
    
    mailSender(email,otp);

    const OTP=await new otpModel({
      email:email,
      otp:otp,
      createdAt:new Date()

    })
    
    const recieve= await OTP.save()

    req.session.mail=email

    console.log(recieve);
    
    console.log('Otp sended')
    res.json({success:true,message:'Otp Sent'});
   
    
  }catch(err){
   console.log('error',err);
   res.json({success:false,message:err.message});
  }
  }

  
// Route to resend OTP
const resendOTP = async (req, res) => {
  try {
    const email = req.session.mail; 
 
    if (!email) {
      return res.json({ success: false, message: "Email not found in session." });
    }

    const otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111; // Generate a new OTP

    // Send the OTP via email
    await mailSender(email, otp);

    // Update the OTP in the database (assuming email is a unique identifier)
    await otpModel.updateOne({ email: email }, { otp: otp, createdAt: new Date() });

    console.log("Resent OTP to:", email);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.log("Error resending OTP:", err);
    res.json({ success: false, message: "Failed to resend OTP" });
  }
};

const createOTP=async(req,res)=>{
  try {
    const {email}=req.body
    console.log(email);
    req.session.mail={email}
    
const otp=Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111; 
  await mailSender(email,otp)

  const OTP=await new otpModel({
    email:email,
    otp:otp,
    createdAt:new Date()

  })

   await OTP.save()
     
     
  res.json({success:true,message:"OTP SENT "})
  } catch (error) {
    res.json({success:false, message:"error to sent mail"})
  }

}

// Register the new route in your Express app
const forPassword=async(req,res)=>{
  const {otp}=req.body
  const {email}=req.session.email
  const otpCheck=await otpModel.findOne({email,otp})
  if(!otpCheck){
    return res.json({success:false,message:"sometging went wrong"})
  }
  res.json({success:true,message:"next method"})
}




const verifyOTP = async (req, res) => {
  
    const { otp } = req.body; // Get the OTP from the request body
 
    const {email} = req.session.userData; // Retrieve email from session

    console.log(otp,email)
    // Check if the OTP and email are present
    if (!otp || !email) {
      return res.json({ success: false, message: "OTP or email not found." });
    }

    // Fetch the OTP record from the database
    const otpRecord = await otpModel.findOne({ email, otp });
console.log('otp checked');

    if (!otpRecord) {
      // If OTP is invalid
      return res.json({ success: false, message: "Invalid OTP." });
    }


    // If OTP is valid, retrieve user data from session
    const { firstName, lastName, email: userEmail, phone, password } = req.session.userData;
    
    const securepswrd = await securePassword(password);



    const checkuser = await User.findOne({ email });
    console.log(checkuser,'chekc user');
    
    if (checkuser){
     
       return     res.json({ success: false, message: "User exist." });
    } 
    console.log(22)
    // Save the user data in the User collection
    const newUser = new User({
      firstName,
      lastName,
      email: userEmail,
      phone,
      password:securepswrd,
      lastLogin:new Date()
    });
    
   
   const newResult= await newUser.save()
    req.session.user=newResult._id
    // console.log(req.session.userData)
    console.log("result,,,",newUser);
   
    
    console.log('after save');
    
  

    // Optionally, delete the OTP record and clear the session
    await otpModel.deleteOne({ email }); // Delete OTP from the database
    console.log('5')
    res.json({ success: true, message: "User registered successfully." });
  
};




const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("working1")
    console.log(req.body,"body email and pass");
    
    const user = await User.findOne({ email });
  
    if (!user){
      
      console.log("no user")
    
      console.log(req.session)
     return res.json({success: false, message: "invalid email" }) 
    }
    console.log('find user',user);
    
    if(user.isActive===false){
      console.log('found blocked user')
     
    return  res.json({success:false,message:"you have been blocked for some reason"})
    }
    
      console.log('active user');

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch){
      console.log("password not match")
      return res.json({success: false, message: "password not match"}) 
    }  

  
    req.session.user = user._id;  
    User.updateOne({email},{lastLogin:new Date()})


     res.json({ success: true, message: "User Login successfully." });
    
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: "Failed to verify OTP." });
    
    
    
  }
};




const logOut=(req,res)=>{
  req.session.destroy()
  res.redirect('/')
}


const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Request body:', req.body);

    // Correcting the findOne query by passing an object
    const RESULT = await User.findOne({ email: email }); // Or simply { email } in ES6 syntax
    console.log('Database result:', RESULT);

    // Check if RESULT exists before accessing RESULT.email
    if (!RESULT) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    // Save the email to the session only if RESULT is valid
    req.session.maill = RESULT.email;

    // Respond with success
    res.json({ success: true, message: "Email verified" });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





const loadSignUp=(req,res)=>{
    res.render('user/signup')
}



const LoadHome=async(req,res)=>{
  console.log('log home');
  
  try {
    const Data=await category.find({isList:true})
    res.render('user/index',{Data,user: req.session.user,CURRENTpage:'Home',Category:null})  
  } catch (error) {
    console.log("from home error",error);
    
  }
  
}


const Loadotp=(req,res)=>{
  const Email=req.session.mail
    
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

  console.log('hhh');
  
  console.log('log shop');
  try {
      
      const Category = req.query.category;
      const cattt=req.query.Category
      const page = parseInt(req.query.page) || 1; 
      const limit = 6; 
      const skip = (page - 1) * limit; 
      let message = '';

      
      const listedCategory = await category.find({ isList: true });
      const listedCategoryNames = listedCategory.map(cat => cat.category);

     
      let query = { isList: true }; 
      if (Category||cattt) {
          
          if (listedCategoryNames.includes(Category)) {
              query.Category = Category;
          } 
      } else {
         
          query.Category = { $in: listedCategoryNames };
      }


      
      const products = await PRODUCT.find(query).skip(skip).limit(limit);
      if (products.length === 0) {
          message = message || 'No products found.';
      }

      

      const totalProducts = await PRODUCT.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      
      if (page > totalPages && totalProducts > 0) {
          return res.redirect(`/user/shop?page=${totalPages}`);
      }

     console.log("category",Category);
     
      res.render('user/shop', {
          products,
          user: req.session.user,
          message,
          listedCategory,
          currentPage: page,
          totalPages,
          CURRENTpage:'shop',
         Category:req.query.category
          
      });
      
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
          success: false,
          message: 'An error occurred while fetching products.',
          error: error.message, // Optional for exposing error details
      });
  }
};

// ******** SEARCH
const search = async (req, res) => {
  const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
  let query = { isList: true };

  try {
    
    const cat = await category.find({ isList: true });
    const listedCategoryNames = cat.map(cat => cat.category);


    if (searchQuery) {
      let regex = new RegExp(`^${searchQuery}`, "i")
      if (listedCategoryNames.some(category => new RegExp(`^${searchQuery}$`, 'i').test(category))) {
        query.Category = { $regex: searchQuery, $options: 'i' }; // Search by category name (case-insensitive)
      } else {
        
        query = {
          isList: true,
          $or: [
            { productTitle: { $regex: searchQuery, $options: 'i' } },
            { Category: { $in: listedCategoryNames, $regex: searchQuery, $options: 'i' } },
            { Brand: { $regex: searchQuery, $options: 'i' } },
          ],
        };
      }
    } else {
      // If no search query, list products in listed categories
      query.Category = { $in: listedCategoryNames };
    }

    console.log(query)
    const products = await PRODUCT.find(query);

    // If no products found, return a message
    if (!products || products.length === 0) {
      return res.json({ message: "No products found" });
    }

    // Return the list of products
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// ///// Realated product 
const productId=async(req,res)=>{
  const productId=req.params.id
 
  
  try {

    const item=await PRODUCT.findById(productId)
console.log(item.Category);

    const related=await PRODUCT.find({
      Category:item.Category,
      _id:{
          $ne:productId
      }
  }).limit(4)

  console.log(related);
  
  const cat=await category.findOne({category:item.Category})
  console.log('cat',cat);
  
  console.log('Offerrrr',cat.Offer);
  
    
    res.render('user/single-product',{item,user: req.session.user,related,CURRENTpage:'product',cat ,Category:item.Category})
  } catch (error) {
    console.log(error)
  }
}


const ALL = async (req, res) => {
  console.log('Fetching products for shop page...');

  try {
    console.log('kayri');
    
    const Category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = 6; 
    const skip = (page - 1) * limit; 
    let message = '';

    // Fetch listed categories
    const listedCategory = await category.find({ isList: true });
    const listedCategoryNames = listedCategory.map(cat => cat.category);

    // Build query
    let query = { isList: true };
    if (Category) {
      if (listedCategoryNames.includes(Category)) {
        query.Category = Category;
      }
    } else {
      query.Category = { $in: listedCategoryNames };
    }

    // Fetch products
    const products = await PRODUCT.find(query).skip(skip).limit(limit);
    const totalProducts = await PRODUCT.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Handle empty results
    if (products.length === 0) {
      message = 'No products found.';
    }

    // JSON Response
    res.json({
      success: true,
      products,
      message: message || 'Products fetched successfully.',
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
      listedCategory, // Optional: Send the list of categories for filtering on the frontend
      selectedCategory: Category || null,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching products.',
      error: error.message, // Optional: Expose detailed error for debugging
    });
  }
};



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
    verifyEmail,
    
    createOTP,
    forPassword,
    shop,
    // singleProduct,
    productId,
    logOut,
    search,
    ALL,
    
   
   
  

}