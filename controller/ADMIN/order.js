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

const validTransitions = {
    Pending: ['Shipped', 'Cancelled'],
    Shipped: ['Out for Delivery', 'Cancelled'],
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
      
      const Notify=await notify.findOne({UserId:req.session.user})
  
      if(Notify){
       
        const current=new Date()
        Notify.notification.push({message:`Your Order has been ${Status}.`,status:'success',createdAt:current})
        console.log('not fount')
        await Notify.save()
      }else{
        const current=new Date()
        const newNotify=new notify({
          UserId:req.session.user,
          notification:[{
            message:`Your Order has been ${Status}.`,createdAt:current
          }]
        })
        await newNotify.save()
      }

      if (order.orderStatus === 'Delivered') {
          order.Products.forEach(product => {
              product.status = 'Delivered'
              product.deliveryDate = new Date()
              product.expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          })

          order.Datess.DeliveryDate = new Date();
          order.Datess.expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    
      await order.save();

      console.log(order);
      res.status(200).json({ success: true, message: 'Order Status Successfully Updated' });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const allReturn = async (req, res) => {
  try {
    console.log('ALL RETURN RES');
    const { response, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    // Fetch the order from the database
    const order = await ORDER.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (response === 'Approve') {
      // Update product statuses and calculate totals
      let sum = 0;
      order.Products.forEach((product) => {
        if (product.status !== 'Cancelled') {
          product.status = 'Returned';

          // Calculate refund for each product
          const adjustments = order.calculateRefundAndAdjustments(product);
          sum += adjustments.floor;
        }
      });

      // Use utility function to calculate updated order fields
      const { subTotal, finalAmount, orderStatus, shipping } = calculateOrderTotals(order);

      // Update the order directly in the database
      await ORDER.updateOne(
        { _id: orderId },
        {
          $set: {
            'Request.admin.status': true,
            'Request.admin.response': 'Approved',
            Products: order.Products,
            subTotal,
            Final_Amount: finalAmount,
            orderStatus,
            Shipping: shipping,
            paymentStatus: 'Refunded',
          },
        }
      );

      // Process refund to wallet
      const userId = order.UserID;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID not found with the order.' });
      }
      const result = await refundWallet(req.session.user, sum);

      // Send a notification to the user
      await sendNotification(
        req.session.user,
        'Your request has been approved and the order has been marked as returned.',
        'success'
      );

      return res.status(200).json({
        success: true,
        message: 'Your request has been approved and the order has been marked as returned.',
      });
    }

    if (response === 'Cancel') {
      // Handle cancellation logic
      await ORDER.updateOne(
        { _id: orderId },
        {
          $set: {
            'Request.admin.status': false,
            'Request.admin.response': 'Cancelled',
          },
        }
      );

     
      await sendNotification(
        req.session.user,
        'Admin has cancelled your return request.',
        'error'
      );

      return res.status(400).json({
        success: false,
        message: 'Cancelled.',
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid response. Use "Approve" or "Cancel".' });
  } catch (error) {
    console.error('Error in allReturn:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    });
  }
};

  

const handleProductAction = async (req, res) => {
    try {
      const { orderId, productId, status, reason, quantity } = req.body;
    console.log(status)
      if (!orderId || !productId || !status) {
        return res.status(400).json({ success: false, message: 'Missing required parameters.' });
      }

      const User = req.session?.user;
      if (!User) {
        return res.status(400).json({ success: false, message: 'User is not logged in.' });
      }
      const order = await ORDER.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const product = order.Products.find((p) => p.product.toString() === productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found in the order.' });
      }
      
      product.status = status;
      product.refundAmound = 0; 
  
       if (status === 'Cancelled') {
        product.cancel = { req: true, reason };
      }
  
      const adjustments = order.calculateRefundAndAdjustments(product)
     
       if(adjustments.success){
        if (status === 'Cancelled') {
            const productDetails = await PRODUCT.findById(productId)
            if (productDetails) {
              productDetails.totalStock += Number(quantity) 
              await productDetails.save()
            }
          }

          
       }

      if(status==='Cancelled'&&order.payment=='razorpay'||order.payment=='wallet'){
        const wallet = await WALLET.findOne({ userId: User })
        if (wallet) {
         
          wallet.transactions.push({ type: 'credit', amount:adjustments.floor })
         
          await wallet.save() 
        } else {
          const newWallet = new WALLET({
            userId: User,
            balance: 0,
            transactions: [
              { type: 'credit', amount: adjustments.floor },
            ],
          })
          await newWallet.save()  
        }
        // product.refundAmound=adjustments.floor
    }
 
  

      await order.save() 

      const allProductsCancelled = order.Products.every((p) => p.status === 'Cancelled')
      if (allProductsCancelled) {
        order.orderStatus = 'Cancelled'
        order.Shipping = 0 
        await order.save()
      }
    
      res.status(200).json({
        success: true,
        message: `Product successfully ${status.toLowerCase()}.`,
        
       
      })
    } catch (error) {
      console.error('Error handling product action:', error.message)
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing the request.',
        error: error.message,
      })
    }
  }



  const forProductReturn = async (req, res) => {
    try {
      console.log('Product Return');
  
      const { selected, itemId, orderId } = req.body;
      
    
      const order = await ORDER.findOne({ _id: orderId });
      if (!order) {
        return res.status(400).json({ success: false, message: 'Order not found.' });
      }
  

  
      const productIndex = order.Products.findIndex((p) => p._id.toString() === itemId);
      if (productIndex === -1) {
        return res.status(400).json({ success: false, message: 'Product not found in the order.' });
      }
  
      const product = order.Products[productIndex];
  
      if (selected === 'Approve') {
       
        product.return.adminStatus.status = true;
        product.return.adminStatus.response = 'Approved';
        product.status = 'Returned';
    
        const adjustments = order.calculateRefundAndAdjustments(product);
        if (!adjustments.success) {
          return res.status(400).json({ success: false, message: 'Error processing refund adjustments.' });
        }
  
       
        const userId = order.UserID;
        if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID not found with the order.' });
        }
       await refundWallet(req.session.user,adjustments.floor)
       
        const updatedTotals = calculateOrderTotals(order)
  
    
        await ORDER.updateOne(
          { _id: orderId, 'Products._id': itemId },
          {
            $set: {
              'Products.$.status': 'Returned', 
              'Products.$.return.adminStatus': {
                status: true,
                response: 'Approved',
              },
              subTotal: updatedTotals.subTotal, 
              Final_Amount: updatedTotals.finalAmount,
              Shipping: updatedTotals.shipping,
              orderStatus: updatedTotals.orderStatus, 
            },
          }
        );
  
   
        await sendNotification(
          req.session.user,
          'Your request has been approved and the order has been marked as returned.',
          'success'
        );
  
        return res.status(200).json({
          success: true,
          message: 'Your request has been approved and the order has been marked as returned.',
        });
      }
  
      return res.status(400).json({ success: false, message: 'Invalid action selected.' });
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };
  
  
  
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
  

  const calculateOrderTotals = (order) => {
    let subTotal = 0;
  

    order.Products.forEach((product) => {
      if (product.status !== 'Cancelled' && product.status !== 'Returned') {
        product.TOTAL = product.Price * product.quantity;
        subTotal += product.TOTAL;
      }
    });
  

    const allProductsReturned = order.Products.every(
      (product) => product.status === 'Returned'
    );
  
    let orderStatus = order.orderStatus;
    let shipping = order.Shipping;
    if (allProductsReturned) {
      orderStatus = 'Returned';
      shipping = 0;
    }

    const finalAmount = Math.max(0, subTotal + shipping - order.Coupon.discountValue);
  
    return {
      subTotal,
      finalAmount,
      orderStatus,
      shipping,
    };
  };
  
module.exports={
    order,
    details,
    OrderStatus,
    handleProductAction,
    allReturn,
    forProductReturn
}



