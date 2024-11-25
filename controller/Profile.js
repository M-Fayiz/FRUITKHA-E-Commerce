const USER= require('../model/userModel')
const bcrypt=require('bcrypt')

const mongoose=require('mongoose');

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
      
      // Validate the ID before using it
    //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    //     return res.status(400).send('Invalid ID');
    //   }
    // new mongoose.Types.ObjectId(req.params.id);
      let userId = req.params.id
      console.log(userId);

      const user = await USER.findById(userId);
      user ? console.log('found user in profilr'):''

      res.render('user/profile', { user });
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


module.exports={
    LoadProfile,
    editProfile,
    ChangePass
}  