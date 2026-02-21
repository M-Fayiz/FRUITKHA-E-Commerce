const ORDER=require('../../model/admin/order-schema')
const PRODUCT=require('../../model/admin/product')
const httpStatusCode = require('../../constant/httpStatusCode')
const httpResponse = require('../../constant/httpResponse')
const { ORDER_STATUS, RETURN_ACTION, RETURN_ADMIN_RESPONSE } = require('../../constant/status/orderStatus')
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../../constant/status/paymentStatus')
const { NOTIFICATION_STATUS } = require('../../constant/status/notificationStatus')
const { sendNotification } = require('../../utils/notification.util')
const { refundWallet } = require('../../utils/wallet.util')
const { calculateRefundAndAdjustments } = require('../../utils/order.util')

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
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.SHIPPED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY],
    [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
    [ORDER_STATUS.RETURNED]:[],
    [ORDER_STATUS.CANCELLED]:[]
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

  const { Status, OrderID } = req.body

  try {

      const order = await ORDER.findById( OrderID)

      if (!order) {
          return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.ORDER_NOT_FOUND })
      }

      order.orderStatus = Status
      order.Products.forEach(product => {
        if (product.status !== ORDER_STATUS.CANCELLED) {
          product.status = Status
        }
      })

        await sendNotification(req.session.user, `Your Order has been ${Status}.`, NOTIFICATION_STATUS.SUCCESS);
      if (order.orderStatus === ORDER_STATUS.DELIVERED) {
          // order.Products.forEach(product => {
          //     product.status = 'Delivered'
              
          // })
          if(order.payment===PAYMENT_METHOD.COD){
            order.paymentStatus=PAYMENT_STATUS.COMPLETED
          }

          order.Datess.DeliveryDate = new Date();
          order.Datess.expiryDate = new Date(Date.now() +1 * 24 * 60 * 60 * 1000)
      }
  
      await order.save();


      res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.ORDER_STATUS_UPDATED });
  } catch (error) {
      console.log(error.message);
      res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};


const handleProductAction = async (req, res) => {
  try {
    const { orderId, productId, status, reason, quantity } = req.body;

    const User = req.session?.user;
    if (!User) {
      return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.NOT_LOGGED_IN });
    }

    const order = await ORDER.findById(orderId);
    if (!order) {
      return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.ORDER_NOT_FOUND });
    }

  

    const productIndex = order.Products.findIndex((p) => p.product.toString() === productId);
    if (productIndex === -1) {
      return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND_IN_ORDER });
    }
    const product = order.Products[productIndex];

    product.status = status;
  

    if (status === ORDER_STATUS.CANCELLED) {
      product.cancel = { req: true, reason };
    }

    const calculation = calculateRefundAndAdjustments(order, product);
   

    if (status === ORDER_STATUS.CANCELLED) {
      await ORDER.findOneAndUpdate(
        { _id: orderId, 'Products.product': productId },
        {
          $set: {
            'Products.$.status': ORDER_STATUS.CANCELLED,
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

    await sendNotification(req.session.user, `Product ${status.toLowerCase()} successfully.`, NOTIFICATION_STATUS.SUCCESS);

    if (status === ORDER_STATUS.CANCELLED && (order.payment === PAYMENT_METHOD.RAZORPAY || order.payment === PAYMENT_METHOD.WALLET)) {
      await refundWallet(order.UserID, calculation.refundAmount);
    }

    const allProductsCancelled = order.Products.every((p) => p.status === ORDER_STATUS.CANCELLED);
    if (allProductsCancelled) {
      order.orderStatus = ORDER_STATUS.CANCELLED;
      order.Shipping = 0;
      order.GST=0
      order.Final_Amount = 0;
      order.Coupon.discountValue=0
      await order.save();
    }

    res.status(httpStatusCode.OK).json({
      success: true,
      message: httpResponse.PRODUCT_STATUS_UPDATED(status),
    });
  } catch (error) {
    console.error('Error handling product action:', error.message);
    res.status(httpStatusCode.SERVER_ERROR).json({
      success: false,
      message: httpResponse.ORDER_PROCESSING_ERROR,
      error: error.message,
    });
  }
};


//     SINGLE PRODUCT RETURN
const ReturnHandle = async (req, res) => {

  try {
    const { selected, itemId, orderId } = req.body;
   console.log(selected)

    const order = await ORDER.findOne({ _id: orderId });
    if (!order) {

      return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.ORDER_NOT_FOUND });
    }

    if (selected === RETURN_ACTION.APPROVE) {
    
     
      if (itemId) {
    
        const productIndex = order.Products.findIndex((p) => p._id.toString() === itemId);
        if (productIndex === -1) {
          return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND_IN_ORDER });
        }

        const product = order.Products[productIndex];
        product.return.adminStatus = { status: true, response: RETURN_ADMIN_RESPONSE.APPROVED };
        product.status = ORDER_STATUS.RETURNED;

        const calculation = calculateRefundAndAdjustments(order, product);
 
        await refundWallet(order.UserID, calculation.refundAmount);

        await ORDER.findOneAndUpdate(
          { _id: orderId, 'Products._id': itemId },
          {
            $set: {
              'Products.$.status': ORDER_STATUS.RETURNED,
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

        await sendNotification(req.session.user, 'Product approved and marked as returned.', NOTIFICATION_STATUS.SUCCESS);
        return res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.PRODUCT_MARKED_RETURNED });
      } else if(!itemId) {
      
        order.Products.forEach((product) => {
          if (product.status !== ORDER_STATUS.CANCELLED) product.status = ORDER_STATUS.RETURNED;
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
              orderStatus: ORDER_STATUS.RETURNED,
              'Request.admin.status': true,
              'Request.admin.response': RETURN_ADMIN_RESPONSE.APPROVED,
              paymentStatus: PAYMENT_STATUS.REFUND,
              'Coupon.discountValue': 0,
            },
          }
        );

        await refundWallet(order.UserID, refundAmount);
        await sendNotification(req.session.user, 'Order approved and marked as returned.', NOTIFICATION_STATUS.SUCCESS);
        return res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.ORDER_MARKED_RETURNED });
      }
  
    }
    
    if (selected === RETURN_ACTION.CANCEL) {
     
      if (itemId) {
        const productIndex = order.Products.findIndex((p) => p._id.toString() === itemId);
        if (productIndex === -1) {
          return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND_IN_ORDER });
        }

        await ORDER.findOneAndUpdate(
          { _id: orderId, 'Products._id': itemId },
          {
            $set: {
              'Products.$.return.adminStatus': { status: false, response: RETURN_ADMIN_RESPONSE.REJECTED },
              
            },
          }
        );

        await sendNotification(req.session.user, 'Product return request rejected.', NOTIFICATION_STATUS.ERROR);
        return res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.PRODUCT_RETURN_REJECTED });
      } else {
        
        await ORDER.findOneAndUpdate(
          { _id: orderId },
          {
            $set: {
              'Request.admin.status': false,
              'Request.admin.response': RETURN_ADMIN_RESPONSE.REJECTED,
            },
          }
        );

        await sendNotification(req.session.user, 'Order return request rejected.', NOTIFICATION_STATUS.ERROR);
        return res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.ORDER_RETURN_REJECTED });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.RETURN_HANDLE_ERROR });
  }
};
module.exports={
    order,
    details,
    OrderStatus,
    handleProductAction,
    // allReturn,
    ReturnHandle
}



