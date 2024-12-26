
const ORDER=require('../../model/ADMIN/Order-schema')
const PRODUCT=require('../../model/ADMIN/product')
const WALLET =require('../../model/User/wallet')


const orderList=async(req,res)=>{
    
    const User = req.session.user;

    if (!User) {
      return res.render('user/orderList', { info: "You are not logged in" })
    }
    
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;
      const orders = await ORDER.find({ UserID: User }).populate('Products.product').sort({ _id: -1 }).skip(skip).limit(limit);

    
      if (!orders ) {
       res.render('user/orderList', { info: "You have no orders yet", orders: [] })
      }
     




const totalOrders = await ORDER.countDocuments();
const totalPages = Math.ceil(totalOrders / limit);


if (skip >= totalOrders && totalOrders > 0) {
    return res.redirect('/admin/order?page=' + totalPages);
}



       
      res.render('user/orderList', { orders ,user:req.session.user,currentPage: page,
        totalPages,
        totalOrders,})
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


// const cancelorder = async (req, res) => {
//     console.log("GET IN CANCEL ORDER");
//     const { itemId, Orderid, product, quantity } = req.body;
  
//     const User = req.session.user;
  
//     if (!User) {
//       return res.status(400).json({ success: false, message: 'User is not logged in' });
//     }
  
//     try {
      
//       const order = await ORDER.findOneAndUpdate(
//         { _id: Orderid, 'Products._id': itemId },
//         { $set: { 'Products.$.status': 'Cancelled' } }, 
//         { new: true }
//       );
  
//       if (!order) {
//         return res.status(404).json({ success: false, message: 'Order or product not found' });
//       }
  
  
//       const productDetails = await PRODUCT.findById(product);
      
  
//       if (!productDetails) {
//         return res.status(404).json({ success: false, message: 'Product not found' });
//       }
   
//    console.log(order,'order')
//       productDetails.Stock += Number(quantity);
//       await productDetails.save();
      
//       const cancelled =order.Products.every(p=>p.status==='Cancelled')
//       if(cancelled){
//         order.status='Cancelled'
//         order.Shipping=0
  
//       }
//       await order.save();
  
//       return res.status(200).json({
//         success: true,
//         message: 'Product has been successfully cancelled',
//         order: order,
//       });
  
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: 'An error occurred while canceling the product',
//       });
//     }
//   };


  const CANCELallORDER = async (req, res) => {
    console.log('GET IN CANCEL ALL ORDER');
    const { orderId } = req.body;
  
    try {
      const user=req.session.user
      const order = await ORDER.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(400).json({ success: false, message: 'Order not found' });
      }
      order.orderStatus = 'Cancelled';
    
      const refundAmount=order.Final_Amount-order.Shipping
      if(order.payment==='razorpay'||order.payment==='wallet'){
         const wallet=await WALLET.findOne({userId:user})
         if(wallet){
        
          wallet.transactions.push({ type: 'credit', amount:refundAmount})
            await wallet.save(); 
         }else{
          const newWallet = new WALLET({
            userId: user,
            balance: 0,
            transactions: [
              { type: 'credit', amount:refundAmount},
            ],
          });
          await newWallet.save()
         }
  
      }
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
      order.Coupon.discountValue=0
  
      await order.save();
  
   
     return res.status(200).json({ success: true, message: 'Order cancelled' });
    } catch (error) {
      console.error(error.message);
      
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };


const ReturnOrder=async(req,res)=>{
  console.log('GET IN RETURN ORDER')
  const {orderId,Reason}=req.body

  try {
    const order=await ORDER.findOne({_id:orderId})
    if(!order){
      return res.status(400).json({success:false,message:'Order not Found'})
    }
    const Current = new Date();
    if (order && new Date(order.Datess.expiryDate) < Current) {
      return res.status(410).json({
        success: false,
        message: 'Your return time for this order has exceeded 2 days , which the allowed period.',
      });
    }

    order.Return.req=true
    order.Return.reason=Reason
  
    await order.save()
 return  res.status(200).json({success:true,message:'Your Request Updated Soon'})
  } catch (error) {
    console.log(error.message)
  }
}

const productReturn=async(req,res)=>{
  console.log('Return Product')
  try {
    const{productId,orderId,Reason}=req.body
   

    const order=await ORDER.findById(orderId)
    if(!order){
      return res.status(400).json({success:false,message:'Order not found'})
    }
    
    const product = order.Products.find((p) => p.product.toString() === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in the order.' });
    }
    const Current = new Date();
    if (order && new Date(order.Datess.expiryDate) < Current) {
      return res.status(410).json({
        success: false,
        message: 'Your return time for this order has exceeded the allowed period.',
      });
    }

    product.return.req=true
    product.return.reason=Reason
 
    await order.save()

    return  res.status(200).json({success:true,message:'Your Request Updated Soon'})
  } catch (error) {
    console.log(error.message)
  }
 


}

  module.exports={
    orderList,
    orderDetails,
    // cancelorder,
    CANCELallORDER,
    ReturnOrder,
    productReturn
  }