const ORDER=require('../../model/ADMIN/Order-schema')
const PRODUCT=require('../../model/ADMIN/product')
const WALLET=require('../../model/User/wallet')
const notify=require('../../model/User/notification')

const order=async(req,res)=>{
    console.log('order list')
try {
    
  const page = parseInt(req.query.page) || 1;
const limit = 6;
const skip = (page - 1) * limit;


const orders = await ORDER.find({}).populate('UserID').sort({ _id: -1 }).skip(skip).limit(limit);


const totalOrders = await ORDER.countDocuments();


const totalPages = Math.ceil(totalOrders / limit);


if (skip >= totalOrders && totalOrders > 0) {
    return res.redirect('/admin/order?page=' + totalPages);
}


res.render('admin/orders', {
    CURRENTpage: 'Order List',
    orders,
    currentPage: page,
    totalPages,
    totalOrders,
});
} catch (error) {
    
}
    
}
// , 'Cancelled', 'Cancelled'
const validTransitions = {
    Pending: ['Shipped'],
    Shipped: ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    Delivered: ['Returned'],
    Returned:[],
    Cancelled:[]
}

const details=async(req,res)=>{
    console.log('GET IN ORDER DETAILS')
    try {
        const orderId=req.params.id
    
        const orders=await ORDER.findOne({_id:orderId}).populate('UserID').populate('Products.product')
        const avilable=validTransitions[orders.orderStatus]
       
        res.render('admin/orders-detail',{CURRENTpage:"Order Details",orders,avilable})
    } catch (error) {
       console.log(error) 
    }
   
}


const OrderStatus = async (req, res) => {
  console.log('GET IN ORDER STATUS')
  const { Status, OrderID } = req.body

  try {

      const order = await ORDER.findById( OrderID)

      if (!order) {
          return res.status(500).json({ success: false, message: 'Order not found' })
      }

      order.orderStatus = Status
      order.Products.forEach(product => {
        if (product.status !== 'Cancelled') { 
          product.status = Status
        }
      })

        await sendNotification( req.session.user, `Your Order has been ${Status}.`,'success');
      if (order.orderStatus === 'Delivered') {
          // order.Products.forEach(product => {
          //     product.status = 'Delivered'
              
          // })
          if(order.payment==='COD'){
            order.paymentStatus='Completed'
          }

          order.Datess.DeliveryDate = new Date();
          order.Datess.expiryDate = new Date(Date.now() +1 * 24 * 60 * 60 * 1000)
      }
      // 
      await order.save();

      console.log(order);
      res.status(200).json({ success: true, message: 'Order Status Successfully Updated' });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

//   ORDER RETURN 
// const allReturn = async (req, res) => {
//   try {
//     const { response, orderId } = req.body;

//     if (!orderId) {
//       return res.status(400).json({ success: false, message: 'Order ID is required.' });
//     }

//     const order = await ORDER.findOne({ _id: orderId });
//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }

//     if (response === 'Approve') {
//       let totalRefund = 0;

//       order.Products.forEach((product) => {
//         if (product.status !== 'Cancelled') {
//           product.status = 'Returned';
//           const { refundAmount } = calculateRefundAndAdjustments(order, product);
//           totalRefund += refundAmount;
//         }
//       });

//       const updatedTotals = calculateOrderTotals(order);

//       await ORDER.findOneAndUpdate(
//         { _id: orderId },
//         {
//           $set: {
//             Products: order.Products,
//             subTotal: updatedTotals.subTotal,
//             Final_Amount: updatedTotals.finalAmount,
//             orderStatus: updatedTotals.orderStatus,
//             Shipping: updatedTotals.shipping,
//             'Request.admin.status': true,
//             'Request.admin.response': 'Approved',
//             paymentStatus: 'Refunded',
//           },
//         }
//       );

//       await refundWallet(order.UserID, totalRefund);
//       await sendNotification(
//         req.session.user,
//         'Your request has been approved and the order has been marked as returned.',
//         'success'
//       );

//       return res.status(200).json({
//         success: true,
//         message: 'Your request has been approved and the order has been marked as returned.',
//       });
//     }

//     if (response === 'Cancel') {
//       await ORDER.findOneAndUpdate(
//         { _id: orderId },
//         {
//           $set: {
//             'Request.admin.status': false,
//             'Request.admin.response': 'Rejected',
//           },
//         }
//       );

//       await sendNotification(
//         req.session.user,
//         'Admin has cancelled your return request.',
//         'error'
//       );

//       return res.status(400).json({
//         success: false,
//         message: 'Cancelled.',
//       });
//     }

//     return res.status(400).json({ success: false, message: 'Invalid response.' });
//   } catch (error) {
//     console.error('Error in allReturn:', error.message);
//     return res.status(500).json({
//       success: false,
//       message: 'An internal server error occurred.',
//     });
//   }
// };

  

const handleProductAction = async (req, res) => {
  try {
    const { orderId, productId, status, reason, quantity } = req.body;

    const User = req.session?.user;
    if (!User) {
      return res.status(400).json({ success: false, message: 'User is not logged in.' });
    }

    const order = await ORDER.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const sum=order.Products.reduce((acc,vl)=>acc+=vl.quantity,0)
    console.log(sum,'summ')

    const productIndex = order.Products.findIndex((p) => p.product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in the order.' });
    }
    const product = order.Products[productIndex];

    product.status = status;
  

    if (status === 'Cancelled') {
      product.cancel = { req: true, reason };
    }

    const calculation = calculateRefundAndAdjustments(order, product);
   

    if (status === 'Cancelled') {
      await ORDER.findOneAndUpdate(
        { _id: orderId, 'Products.product': productId },
        {
          $set: {
            'Products.$.status': 'Cancelled',
            'Products.$.refundAmount':calculation.refundAmount,
            subTotal: calculation.remainingSubTotal,
            GST:calculation.remainingGst,
            Final_Amount: calculation.finalAmount,
            Shipping: calculation.shipping,
            orderStatus: calculation.orderStatus,
            'Coupon.discountValue': calculation.remainingDiscount,
          },
        }
      );
    }
    const productDetails = await PRODUCT.findById(productId)
            if (productDetails) {
              productDetails.totalStock += Number(quantity) 
              await productDetails.save()
            }

    await sendNotification(req.session.user, `Product ${status.toLowerCase()} successfully.`, 'success');

    if (status === 'Cancelled' && (order.payment === 'razorpay' || order.payment === 'wallet')) {
      await refundWallet(order.UserID, calculation.refundAmount);
    }

    const allProductsCancelled = order.Products.every((p) => p.status === 'Cancelled');
    if (allProductsCancelled) {
      order.orderStatus = 'Cancelled';
      order.Shipping = 0;
      order.GST=0
      order.Final_Amount = 0;
      order.Coupon.discountValue=0
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: `Product successfully ${status.toLowerCase()}.`,
    });
  } catch (error) {
    console.error('Error handling product action:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the request.',
      error: error.message,
    });
  }
};


//     SINGLE PRODUCT RETURN
const ReturnHandle = async (req, res) => {
  console.log('Return Handle ')
  try {
    const { selected, itemId, orderId } = req.body;
   console.log(selected)

    const order = await ORDER.findOne({ _id: orderId });
    if (!order) {
      console.log('order not found')
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (selected === 'Approve') {
    
      
      if (itemId) {
    
        const productIndex = order.Products.findIndex((p) => p._id.toString() === itemId);
        if (productIndex === -1) {
          return res.status(400).json({ success: false, message: 'Product not found in the order.' });
        }

        const product = order.Products[productIndex];
        product.return.adminStatus = { status: true, response: 'Approved' };
        product.status = 'Returned';

        const calculation = calculateRefundAndAdjustments(order, product);
        console.log(calculation.refundAmount,'refund calcultatuon')
        await refundWallet(order.UserID, calculation.refundAmount);

        await ORDER.findOneAndUpdate(
          { _id: orderId, 'Products._id': itemId },
          {
            $set: {
              'Products.$.status': 'Returned',
             'Products.$.refundAmount': calculation.refundAmount,
              'Products.$.return.adminStatus': product.return.adminStatus,
              subTotal: calculation.remainingSubTotal,
              Final_Amount: calculation.finalAmount,
              GST:calculation.remainingGst,
              Shipping: calculation.shipping,
              orderStatus: calculation.orderStatus,
              'Coupon.discountValue': calculation.remainingDiscount,
            },
          }
        );

        await sendNotification(req.session.user, 'Product approved and marked as returned.', 'success');
        return res.status(200).json({ success: true, message: 'Product marked as returned.' });
      } else if(!itemId) {
      
        order.Products.forEach((product) => {
          if (product.status !== 'Cancelled') product.status = 'Returned';
        });

        const refundAmount = order.Final_Amount - order.Shipping;
        await ORDER.findOneAndUpdate(
          { _id: orderId },
          {
            $set: {
              Products: order.Products,
              subTotal: 0,
              Final_Amount: 40,
              GST:0,
              orderStatus: 'Returned',
              'Request.admin.status': true,
              'Request.admin.response': 'Approved',
              paymentStatus: 'Refund',
              'Coupon.discountValue': 0,
            },
          }
        );

        await refundWallet(order.UserID, refundAmount);
        await sendNotification(req.session.user, 'Order approved and marked as returned.', 'success');
        return res.status(200).json({ success: true, message: 'Order marked as returned.' });
      }
  
    }
    
    if (selected === 'Cancel') {
     
      if (itemId) {
        const productIndex = order.Products.findIndex((p) => p._id.toString() === itemId);
        if (productIndex === -1) {
          return res.status(400).json({ success: false, message: 'Product not found in the order.' });
        }

        await ORDER.findOneAndUpdate(
          { _id: orderId, 'Products._id': itemId },
          {
            $set: {
              'Products.$.return.adminStatus': { status: false, response: 'Rejected' },
            },
          }
        );

        await sendNotification(req.session.user, 'Product return request rejected.', 'error');
        return res.status(200).json({ success: true, message: 'Product return rejected.' });
      } else {
        
        await ORDER.findOneAndUpdate(
          { _id: orderId },
          {
            $set: {
              'Request.admin.status': false,
              'Request.admin.response': 'Rejected',
            },
          }
        );

        await sendNotification(req.session.user, 'Order return request rejected.', 'error');
        return res.status(200).json({ success: true, message: 'Order return rejected.' });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

  
  // Shipping: updatedTotals.shipping,
  
  //  |   NOTIFICATION AREA
  const sendNotification = async (userId, message, status ) => {
    try {
      const current = new Date();
      let Notify = await notify.findOne({ UserId: userId });
      if (Notify) {
        Notify.notification.push({ message, status, createdAt: current });
        await Notify.save();
      } else {
        Notify = new notify({
          UserId: userId,
          notification: [{ message, status, createdAt: current }],
        });
        await Notify.save();
      }
    } catch (error) {
      console.error('Error sending notification:', error.message);
    }
  };
  //     |    REFUND MANAGEMENT   |
  const refundWallet = async (userId, amount) => {
    try {
      let wallet = await WALLET.findOne({ userId });
      if (wallet) {
        wallet.transactions.push({ type: 'credit', amount });
        await wallet.save();
      } else {
        wallet = new WALLET({
          userId,
          transactions: [{ type: 'credit', amount }],
        });
        await wallet.save();
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating wallet:', error.message);
      return { success: false, message: 'Failed to update wallet.' };
    }
  };
 
  const calculateRefundAndAdjustments = (order, product) => {
      
      const initialSubTotal = order.subTotal;
      const initialDiscount = order.Coupon.discountValue;
      const intialGst=order.GST

      const allProductsReturned = order.Products.every((product) => product.status === 'Returned');
      const shipping = allProductsReturned ? 0 : order.Shipping;

    //  console.log(initialDiscount, 'intital discount',initialSubTotal)
      const productGSTshare=Math.round((intialGst/initialSubTotal)*product.TOTAL)
      console.log(productGSTshare,'gst rate')
      const productDiscountShare = Math.round((initialDiscount / initialSubTotal) * product.TOTAL);
      const refundAmount = product.TOTAL+productGSTshare - productDiscountShare;
      // console.log(productDiscountShare,'product discount share')
    const remainingGst=Math.round(intialGst-productGSTshare)
    const remainingSubTotal = Math.max(0, initialSubTotal - product.TOTAL);
    const remainingDiscount = Math.round(initialDiscount - productDiscountShare);
    const finalAmount = Math.max(0, remainingSubTotal + remainingGst+shipping - remainingDiscount);
    // console.log(remainingDiscount,'dis',remainingSubTotal,'sub',finalAmount,'final')
    console.log(remainingGst,'ramining')
    // console.log(remainingDiscount,'remaining discount')
    return {
      refundAmount: Math.round(refundAmount),
      orderStatus: allProductsReturned ? 'Returned' : order.orderStatus,
      remainingSubTotal,
      remainingDiscount,
      finalAmount,
      shipping,
      remainingGst
    };
  };
  


module.exports={
    order,
    details,
    OrderStatus,
    handleProductAction,
    // allReturn,
    ReturnHandle
}



