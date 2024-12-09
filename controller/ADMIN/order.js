const ORDER=require('../../model/ADMIN/Order-schema')

const order=async(req,res)=>{
try {

    const orders=await ORDER.find({}).populate('UserID')
   
    res.render('admin/orders',{CURRENTpage:'Order List',orders})
} catch (error) {
    
}
    
}

const details=async(req,res)=>{
    console.log('GET IN ORDER DETAILS')
    try {
        const orderId=req.params.id
    
        const orders=await ORDER.findOne({_id:orderId}).populate('UserID').populate('Products.product')
     
        res.render('admin/orders-detail',{CURRENTpage:"Order Details",orders})
    } catch (error) {
       console.log(error) 
    }
   
}


const OrderStatus=async(req,res)=>{
    console.log('GET IN IRDER STATUS')
      const {Status,OrdeID}=req.body
      try {
        const orders=await ORDER.findByIdAndUpdate(OrdeID,{status:Status})
        if(!orders){
            return res.status(500).json({success:false,message:'Failed to Update Status'})
        }
       
        console.log(orders)
        res.status(200).json({success:true,message:'Order Status Succesfully Updated'})

      } catch (error) {
        console.log(errpr.message)
        res.status(500).json({success:false,message:'Internal Error'})
      }
      
      
      
}


module.exports={
    order,
    details,
    OrderStatus
}