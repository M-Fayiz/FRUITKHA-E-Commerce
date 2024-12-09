const USER= require('../../model/User/userModel')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {sendForgotPasswordMail}=require('../../utils/mail_sender')
const secret=require('../../utils/env')
const mongoose=require('mongoose');
const TOKEN=require('../../model/User/token')
const crypto = require('crypto');
// const { log } = require('console')
const ORDER=require('../../model/ADMIN/Order-schema')
const PRODUCT=require('../../model/ADMIN/product')
// Generate a random token



const secretKEY=secret.JWT_SECRET

const securePassword = async (password) => {
    try {
      const hashpassword = await bcrypt.hash(password, 10);
      return hashpassword;
    } catch (error) {
      console.log(error);
    }
  };

let LoadProfile = async (req, res) => {
    try {
      console.log(typeof req.params.id);
      
    
      let userId = req.params.id
      console.log(userId);

      const user = await USER.findById(userId);
     

      res.render('user/profile', { user,CURRENTpage:'Profile' });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server error');
    }
  };

const editProfile=async(req,res)=>{
    try {
        console.log('msg from edit message')
        const {FIRST,LAST,phone,ID}=req.body
        console.log(ID,'ID')
        const data=await USER.findByIdAndUpdate(ID,{
            firstName:FIRST,
            lastName:LAST,
            phone:phone
        },{new:true})

        console.log('retrive data from user',data)
        if(data){
            res.status(200).json({success:true,message:'Profile Succesfully Updated'})
        }else{
            res.status(404).json({success:false,message:'failed to update Profile'})
        }

    } catch (error) {
        console.log('error',error.message)
    }
}


const ChangePass = async (req, res) => {
    try {
        console.log('get in change password');
  
        const { password, PAS1, userID } = req.body;

        console.log(userID);
        
        // Retrieve the user from the database
        const data = await USER.findById(userID);

        if (!data) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Compare the entered password (plain-text) with the hashed password in the database
        const isMatch = await bcrypt.compare(password, data.password);  // password entered by user, data.password is hashed

        if (!isMatch) {
            return res.status(404).json({ success: false, message: 'Current Password is not Match' });
        }

        // Hash the new password
        const newPass = await securePassword(PAS1); // Hash the new password with bcrypt

        // Update the password in the database
        const result = await USER.findByIdAndUpdate(userID, {
            password: newPass
        });

        console.log('Password successfully updated');
        
        if (result) {
            res.status(200).json({ success: true, message: 'Password Successfully Changed' });
        } else {
            res.status(500).json({ success: false, message: 'Password change failed' });
        }
    } catch (error) {
        console.log('Error from change password:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const rest=(req,res)=>{
    res.render('user/reset')
}
const forgotPAS = async (req, res) => {
    console.log("Entered forgot password");
  
    const { email } = req.body;
   console.log(email)
    try {
     
      const result = await USER.findOne({ email });
      console.log(result, "User found in forgot password");
  
      if (!result) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      
      const resetToken = crypto.randomBytes(32).toString("hex");
  
console.log('after tokrn');

      let existingToken = await TOKEN.findOne({ userID: result.id });
      if (existingToken) {
       
        existingToken.token = resetToken;
     
        await existingToken.save();
      } else {
    
        const saveTOKEN = new TOKEN({
          userID: result._id,
          token: resetToken,
    
        });
        await saveTOKEN.save();
      }
  
      console.log("Token saved successfully");
  
      
      try {
        await sendForgotPasswordMail(result.email, resetToken);
        res.status(200).json({ success: true, message: "Reset email sent" });
      } catch (err) {
        console.error("Failed to send reset email:", err.message);
        res
          .status(500)
          .json({ success: false, message: "Failed to send reset email" });
      }
    } catch (error) {
      console.error("Error in forgot password:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
const REST=async(req,res)=>{
   console.log('get in')

   const{newPassword,token}=req.body

   console.log(req.body)
   console.log(newPassword,token)
try {
    const result=await TOKEN.findOne({token:token})
    if(!result){
        return res.status(404).json({success:false,message:'Invalid token'})
    }

    const secure=await securePassword(newPassword)
console.log('secure',secure)
  console.log(result)
    const data=await USER.findByIdAndUpdate(result.userID,{
        password:secure
    })
 console.log('data',data)

    if(data){
        res.status(200).json({success:true,message:'Password updated succesfully'})
    }
    
} catch (error) {
    console.log(error.message)
}


}

const newpass=(req,res)=>{
    res.render('user/newPASS')
}


const orderList=async(req,res)=>{
    
        const User = req.session.user;
console.log(User,'uhuuer')
        if (!User) {
          return res.render('user/orderList', { info: "You are not logged in" })
        }
        
        try {
         
          const orders = await ORDER.find({ UserID: User }).populate('Products.product')
        
          if (!orders ) {
           res.render('user/orderList', { info: "You have no orders yet", orders: [] })
          }
        
       
          res.render('user/orderList', { orders ,user:req.session.user})
        } catch (error) {
          console.error(error.message);
          res.status(500).send("Server Error")
        }
        
    
    
}

const orderDetails=async(req,res)=>{
    console.log('ORDER DETAILS')
    const orderId=req.params.id
    console.log(orderId,'id')
    try {
       
   
        const Order=await ORDER.findOne({_id:orderId}).populate('Products.product').populate('UserID')
        
        res.render('user/orderDetails',{Order,user:req.session.user})
    } catch (error) {
      console.log(error.message)  
    }
}


const cancelorder = async (req, res) => {
  console.log("GET IN CANCEL ORDER");
  const { productID, Orderid, product, quantity } = req.body;
  console.log(productID, 'order id:', Orderid);
  const User = req.session.user;

  if (!User) {
    return res.status(400).json({ success: false, message: 'User is not logged in' });
  }

  try {
    
    const order = await ORDER.findOneAndUpdate(
      { _id: Orderid, 'Products._id': productID },
      { $set: { 'Products.$.status': 'Cancelled' } }, 
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order or product not found' });
    }


    const productDetails = await PRODUCT.findById(product);
    console.log(productDetails, 'product');

    if (!productDetails) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
 
 console.log(order,'order')
    productDetails.Stock += Number(quantity);
    await productDetails.save();
    
    const cancelled =order.Products.every(p=>p.status==='Cancelled')
    if(cancelled){
      order.status='Cancelled'
      order.Shippinf=0
    }else{
      order.subTotal = order.Products.reduce((total, p) => {
        if (p.status !== 'Cancelled') {
          total += p.TOTAL;
        }
        return total;
      }, 0);
      console.log( order.subTotal,'sub')
      order.GRND_TOTAL = order.subTotal + order.Shipping;
    }
    
   


    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Product has been successfully cancelled',
      order: order,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while canceling the product',
    });
  }
};

const CANCEL = async (req, res) => {
  console.log('GET IN CANCEL ORDER');
  const { orderId } = req.body;

  try {
    const order = await ORDER.findOne({ _id: orderId });

    if (!order) {
      return res.status(400).json({ success: false, message: 'Order not found' });
    }
    console.log(order,'--=-=-=-=')

    order.status = 'Cancelled';
    console.log(order.status)

    if (Array.isArray(order.Products)) {
      for (const p of order.Products) {
        p.status = 'Cancelled';

       
        const product = await PRODUCT.findOne({ _id: p.productId });
        if (product) {
         
          product.Stock += p.quantity; 
          await product.save(); 
        }
      }
    }
    
    order.Shipping=0


    await order.save();

 
   return res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    console.error(error.message);
    
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports={
    LoadProfile,
    editProfile,
    ChangePass,
    rest,
    forgotPAS,
    newpass,
    REST,
    orderList,
    orderDetails,
    cancelorder,
    CANCEL

}  