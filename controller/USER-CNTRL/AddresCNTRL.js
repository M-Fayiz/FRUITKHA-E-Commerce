const USER= require('../../model/User/userModel')
// const bcrypt=require('bcrypt')
const ADDRES=require('../../model/User/address')

const mongoose=require('mongoose');

const address=async (req,res)=>{
    console.log('get in address')
    try {
        // const data=await USER.findOne()
        console.log(req.session.user,'user session')
        const addres=await ADDRES.find({UserID:req.session.user})

    res.render('user/address',{user:req.session.user,addres})
    } catch (error) {
        console.log('')
    }

}

const addAddres=async(req,res)=>{
    console.log('- - LOG IN ADD ADDRESS - -')
    try {
       const{ Name,adres_name,pincode,place,city,state,user,mark}=req.body
        
    console.log(user)
      const DATA=await ADDRES.findOne({
        UserID:user,
        Address_name:adres_name,
        Name:Name,
        PIN:pincode,
        place:place,
        mark:mark,
        District:city,
        State:state
      })
      if(DATA){
        return res.json({success:false,message:'the Address Already Exist'})
      }else{
        const result=new ADDRES({
            UserID:user,
            Address_name:adres_name,
            Name:Name,
            PIN:pincode,
            place:place,
            mark:mark,
            District:city,
            State:state
           })
    
          const data= await result.save()
    
          if(data){
            console.log('data save',data)
            res.status(200).json({success:true,message:'Address succesfully Added'})
          }   else{
            res.status(500).json({success:false,message:'Failed to add Address'})
          }
      }
          
      
    } catch (error) {
        console.log(error.message)
    }
}


const rm_adres = async (req, res) => {
    console.log('Entered rm_adres function');

    try {
        console.log('Request body:', req.body);

        const adrsID = req.body.adrsID;
        if (!adrsID) {
            return res.status(400).json({ success: false, message: 'Address ID is required' });
        }

        console.log('Attempting to delete address with UserID:', adrsID);

        const result = await ADDRES.findByIdAndDelete(adrsID);


        console.log('Delete result:', result);

        if (result.deletedCount === 0) {
            return res.status(500).json({ success: false, message: 'Failed to Delete Address' });
        }

        res.status(200).json({ success: true, message: 'Address Successfully Deleted' });

    } catch (error) {
        console.error('Error while deleting address:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const editAdddres=async(req,res)=>{
    console.log('GET IN EDIT ADDRESS')
    try {
        const {Name,AdName,PIN,PLace,City,State,Mark,user}=req.body
   const result=await ADDRES.findByIdAndUpdate(user,{
    Address_name:AdName,
    Name:Name,
    PIN:PIN,
    place:PLace,
    mark:Mark,
    District:City,
    State:State
   })
   if(!result){
    return res.status(404).json({success:false,message:'User Not Found'})
   }


        res.json({success:true,message:'Address Updated Succesfully'})
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    address,
    addAddres,
    rm_adres,
    editAdddres
}

