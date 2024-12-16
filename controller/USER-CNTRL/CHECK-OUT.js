const USER=require('../../model/User/userModel')
const CART=require('../../model/User/CART')
const ADDRESS=require('../../model/User/address')
const PRODUCT=require('../../model/ADMIN/product')
const ORDER=require('../../model/ADMIN/Order-schema')
const COUPON=require('../../model/ADMIN/Coupon')
const razorpay=require('../../utils/service/Razorpay')
const crypto = require('crypto')
const Wallet=require('../../model/User/wallet')
const notify=require('../../model/User/notification')

const checkout = async (req, res) => {
    console.log('- - - LOG CHECKED - - -')
    try {
      const UserID = req.session.user;
  
      console.log(UserID)
      const address = await ADDRESS.find({UserID});
      const cart = await CART.findOne({ UserID:UserID }).populate('Products.productId')
      const coupon=await COUPON.find({status:'Active'})
      const NOtify=await notify.findOne({UserId:req.session.user}).sort({createdAt:-1})
      if (!address) {
        
        res.render('user/checkout', {
          CURRENTpage: 'checkout',
          user: req.session.user,
          address: [],
          info: 'No Address Added Yet',
          NOtify
        });
      } else {
        const shipping=50
        let TOTAL=shipping+cart.TTLPrice
        res.render('user/checkout', {
          CURRENTpage: 'checkout',
          user: req.session.user,
          address,
          cart,
          info: '',
          shipping,
          TOTAL,
          coupon,
          NOtify
        });
      }
    } catch (error) {
      
      console.error('Error in checkout:', error);
      res.status(500).send('Something went wrong. Please try again later.');
    }
  };

const placeOrder = async (req, res) => {
    console.log('GET IN PLACE ORDER')
    console.log(req.body)
    try {
      const {selectedAddress,paymentMethod, razorpay_order_id,razorpay_payment_id,razorpay_signature,} = req.body;
        
        const User = req.session.user;

      if (!User) {
        return res.status(400).json({ success: false, message: 'User Not Found' });
      }
  
      const address = await ADDRESS.findById(selectedAddress);
      if (!address) {
        return res.status(400).json({ success: false, message: 'Address Not Found' });
      }
  
      const cart = await CART.findOne({ UserID: User });
      if (!cart || cart.Products.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart is Empty' });
      }
  
      let discountValue = 0;
      let couponCode = null;
      let couponId = cart.Discount?.discountId;
      if (cart.Discount?.discountId) {
        const coupon = await COUPON.findById(cart.Discount.discountId);
        if (coupon) {
          const now = new Date();
          if (coupon.status === 'Active' && now >= coupon.startDate && now <= coupon.endDate) {
            if (coupon.minCartValue && cart.subTotal >= coupon.minCartValue) {
              discountValue = cart.Discount.discount_amount;
              console.log(discountValue,'hjh jhj hjh')
              couponCode = coupon.code;
            }
          }
        }
      }
  
      let paymentStatus = 'Pending';
   
      if (paymentMethod === 'razorpay') {
       
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return res.status(422).json({ success: false, message: 'Missing Razorpay Payment Details' });
        }
  
        const secret = process.env.key_secret;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest('hex');
  
        if (generated_signature !== razorpay_signature) {
          return res.status(400).json({ success: false, message: 'Invalid Razorpay Signature' });
        }
  
   
        paymentStatus = 'Completed';
      } else if (paymentMethod === 'wallet') {
   
        const wallet=await Wallet.findOne({userId:req.session.user})
    
        if(!wallet){
          return res.status(400).json({success:true,message:'Wallet Not Found'})
        }

        const walletBalance = wallet.balance
        const totalAmount = cart.subTotal - discountValue;
        console.log(totalAmount,walletBalance)
         if (walletBalance < totalAmount) {
          return res.status(400).json({ success: false, message: 'Insufficient Wallet Balance' });
         }
        
        wallet.transactions.push({ type: 'debit', amount:totalAmount})
        await wallet.save()
        paymentStatus = 'Completed';
      } else if (paymentMethod === 'COD') {
        console.log('Order will be placed via COD');
      } 
  
    
      const orderData = {
        UserID: User,
        Products: cart.Products.map((item) => ({
          product: item.productId,
          Name: item.Name,
          quantity: item.quantity,
          Price: item.Price,
        })),
        Shipping: cart.Shipping,
        Coupon: {
          couponId,
          code: couponCode || 'N/A',
          discountValue,
        },
        payment: paymentMethod,
        paymentStatus,
        addressId: {
          address: address.Address_name,
          Name: address.Name,
          PIN: address.PIN,
          place: address.place,
          mark: address.mark,
          District: address.District,
          State: address.State,
        },
        Datess:{
          DeliveryDate:new Date()
        },
        RazorPay: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      };
  
      const newOrder = new ORDER(orderData);
      await newOrder.save();
  
     
      for (const item of cart.Products) {
        const product = await PRODUCT.findById(item.productId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
        }
        if (product.totalStock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.Name}` });
        }
        product.totalStock -= item.quantity;
        await product.save();
      }
  
      await CART.findOneAndDelete({ UserID: User });
  
      return res.status(200).json({
        success: true,
        message: 'Order Placed Successfully',
        order: newOrder,
      });
    } catch (error) {
      console.error('Error Placing Order:', error.message);
      return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  };
  
  
  const razorPay = async (req, res) => {
    const { amount } = req.body;
  
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
  
    try {
      const options = {
        amount: amount * 100, 
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };
  
      const order = await razorpay.orders.create(options);
      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
  };
  
  const verifyPayment = async (req, res) => {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(422).json({ success: false, message: 'Missing required fields' });
    }
  
    try {
     
      const secret = process.env.key_secret;
      if (!secret) {
        throw new Error('Razorpay secret is missing');
      }
  
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generated_signature = hmac.digest('hex');
  
      if (generated_signature === razorpay_signature) {
        res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};
  
  
  

module.exports={
    checkout,
    placeOrder,
    razorPay,
    verifyPayment
}