const WALLET=require('../../model/User/wallet')

const wallet=async(req,res)=>{
  try {
    const Wallet=await WALLET.findOne({userId:req.session.user})

    res.render('user/wallet',{user:req.session.user,CURRENTpage:'wallet',Wallet})
  } catch (error) {
    console.log(error.message)
  }
   
}




module.exports={
    wallet
}