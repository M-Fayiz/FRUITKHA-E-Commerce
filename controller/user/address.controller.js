const USER= require('../../model/user/userModel')
const ADDRES=require('../../model/user/address')
const httpStatusCode = require('../../constant/httpStatusCode')
const httpResponse = require('../../constant/httpResponse')

const mongoose=require('mongoose');

const address=async (req,res)=>{
    console.log('get in address')
    try {
    
        console.log(req.session.user,'user session')
        const addres=await ADDRES.find({UserID:req.session.user})

    res.render('user/address',{user:req.session.user,addres})
    } catch (error) {
        console.log('')
    }

}

const addAddres=async(req,res)=>{
  
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
        return res.status(httpStatusCode.ITEM_EXIST).json({success:false,message:httpResponse.ADDRESS_EXISTS})
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
            res.status(httpStatusCode.CREATED).json({success:true,message:httpResponse.ADDRESS_ADDED})
          }   else{
            res.status(httpStatusCode.SERVER_ERROR).json({success:false,message:httpResponse.ADDRESS_ADD_FAILED})
          }
      }
          
      
    } catch (error) {
        console.log(error.message)
        return res.status(httpStatusCode.SERVER_ERROR).json({ success:false, message:httpResponse.SERVER_ERROR })
    }
}


const rm_adres = async (req, res) => {


    try {
      

        const adrsID = req.body.adrsID;
        if (!adrsID) {
            return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.ADDRESS_ID_REQUIRED });
        }

       

        const result = await ADDRES.findByIdAndDelete(adrsID);


        console.log('Delete result:', result);

        if (!result) {
            return res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.ADDRESS_DELETE_FAILED });
        }

        res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.ADDRESS_DELETED });

    } catch (error) {
        console.error('Error while deleting address:', error.message);
        res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.SERVER_ERROR });
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
    return res.status(httpStatusCode.ITEM_NOT_FOUND).json({success:false,message:httpResponse.USER_NOT_FOUND_CAP})
   }


        res.status(httpStatusCode.OK).json({success:true,message:httpResponse.ADDRESS_UPDATED})
    } catch (error) {
        console.log(error.message)
        return res.status(httpStatusCode.SERVER_ERROR).json({ success:false, message:httpResponse.SERVER_ERROR })
    }
}


module.exports={
    address,
    addAddres,
    rm_adres,
    editAdddres
}

