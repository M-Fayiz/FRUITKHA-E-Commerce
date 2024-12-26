const USER= require('../../model/User/userModel')
const bcrypt=require('bcrypt')

const {sendForgotPasswordMail}=require('../../utils/mail_sender')
const secret=require('../../utils/env')
const TOKEN=require('../../model/User/token')
const crypto = require('crypto');

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
      console.log(userId)
    

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











module.exports={
    LoadProfile,
    editProfile,
    ChangePass,
    rest,
    forgotPAS,
    newpass,
    REST,
  

}  