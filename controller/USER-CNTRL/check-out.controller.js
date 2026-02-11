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
const path = require('path');
const ejs = require('ejs');
const PDFDocument = require('pdfkit');
const wishList=require('../../model/User/wishList')

const checkout = async (req, res) => {
    console.log('- - - LOG CHECKED - - -')
    try {
      const UserID = req.session.user;
  
      console.log(UserID)
      const address = await ADDRESS.find({UserID});
      const cart = await CART.findOne({ UserID:UserID }).populate('Products.productId')
      const coupon=await COUPON.find({status:'Active'})
      const NOtify=await notify.findOne({UserId:req.session.user}).sort({createdAt:-1})
     
      let carSize
      if(cart&&cart.Products){
        carSize=cart.Products.length
      }
      let size
      const wishlist = await wishList.findOne({ UserId: req.session.user })
       
        if (wishlist && wishlist.Products) {
          wishlist.Products.length >0?size=wishlist.Products.length:size=null
      }
      if (!address) {
        
        res.render('user/checkout', {
          CURRENTpage: 'checkout',
          user: req.session.user,
          address: [],
          info: 'No Address Added Yet',
          NOtify,
          carSize,
          size
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
          NOtify,
          carSize,
          size
        });
      }
    } catch (error) {
      
      console.error('Error in checkout:', error);
      res.status(500).send('Something went wrong. Please try again later.');
    }
  };

  const placeOrder = async (req, res) => {
    console.log('PLACE ORDER');
   
  
    try {
      const { selectedAddress, paymentMethod, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const User = req.session.user;
  console.log(paymentMethod)
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
      
      let gst=Math.round(0.12*cart.subTotal)
      console.log(gst,'gst')
      let discountValue = 0;
      let couponCode = null;
      let couponId = cart.Discount?.discountId;
  
      if (couponId) {
        const coupon = await COUPON.findById(couponId);
        if (coupon) {
          const now = new Date();
          if (coupon.status === 'Active' && now >= coupon.startDate && now <= coupon.endDate) {
            if (coupon.minCartValue && cart.subTotal >= coupon.minCartValue) {
              discountValue = cart.Discount.discount_amount;
              couponCode = coupon.code;
            }
          }
        }
      }
  
      let paymentStatus = 'Pending'; 
     
      if (paymentMethod === 'razorpay') {
        if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      
          const secret = process.env.key_secret;
          const hmac = crypto.createHmac('sha256', secret);
          hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
          const generated_signature = hmac.digest('hex');
         
          if (generated_signature === razorpay_signature) {
            paymentStatus = 'Completed';
          } 
        } else {
          paymentStatus = 'Pending';
        }
      } else if (paymentMethod === 'wallet') {
        
        const wallet = await Wallet.findOne({ userId: User });
        
        if (!wallet || !wallet.balance) {
        return res.status(400).json({success:true,message:'Wallet Not found'})
        } 
        console.log(gst)
        const walletBalance = wallet.balance
        const totalAmount = cart.subTotal+gst - discountValue;
        console.log(totalAmount)
        console.log(totalAmount,'total amount',walletBalance)
         if (walletBalance < totalAmount) {
          return res.status(400).json({ success: false, message: 'Insufficient Wallet Balance' });
         }
        
        wallet.transactions.push({ type: 'debit', amount:totalAmount})
        await wallet.save()
        paymentStatus = 'Completed';
      } else if (paymentMethod === 'COD') {
        paymentStatus = 'Pending';
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
          code: couponCode ,
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
        Datess: {
          DeliveryDate: new Date(),
        },
        RazorPay: {
          razorpay_order_id: razorpay_order_id ,
          razorpay_payment_id: razorpay_payment_id ,
          razorpay_signature: razorpay_signature ,
        },
      };
     console.log('ORDER is going to save')
      const newOrder = new ORDER(orderData);
     const hh= await newOrder.save();
   
    
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
  
      res.status(200).json({
        success: true,
        message: 'Order Placed Successfully',
        order: newOrder,
      });
    } catch (error) {
      console.error('Error Placing Order:', error.message);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  };
  
  // RAZOR PAY  |  RAZOR PAY  |
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
  
      const order = await razorpay.orders.create(options)
      
      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
  };
  
  const verifyPayment = async (req, res) => {
    console.log('///////')
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // console.log(orderId)
  // console.log('req . body ',req.body)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
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
       
        await ORDER.findByIdAndUpdate(orderId, {
          $set: {
            paymentStatus: 'Completed',
            'RazorPay.razorpay_payment_id': razorpay_payment_id,
            'RazorPay.razorpay_signature': razorpay_signature,
          },
        });
   
        return res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
  };

  
const retryPayment = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  try {
   
    const order = await ORDER.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const options = {
      amount: order.Final_Amount * 100, 
      currency: 'INR',
      receipt: `retry_${orderId.slice(0, 20)}_${Date.now().toString().slice(-5)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder || !razorpayOrder.id) {
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }

    await ORDER.findByIdAndUpdate(orderId, {
      $set: { 'RazorPay.razorpay_order_id': razorpayOrder.id, status: 'retrying' },
    });
    
    return res.status(200).json({ 
      success: true, 
      razorpayOrder, 
      razorpayKey: process.env.key_id, 
    });
  } catch (error) {
    console.error('Error during retry payment:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const success=async(req,res)=>{
  try {
  const orderId= req.params.id
  const order=await ORDER.findById(orderId)
    res.render('user/success',{order})
    
  } catch (error) {
    console.log(error.message)
  }
}

const invoice = async (req, res) => {
  try {
      const orderId = req.params.id;
     
      const randomNumber = Math.floor(1000 + Math.random() * 9000)


     
      const order = await ORDER.findById(orderId).populate('UserID').populate('Products.product')
      if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }

    
      const doc = new PDFDocument({ margin: 30 });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
          'Content-Disposition',
          `attachment; filename=invoice_${order._id}.pdf`
      );
  
      // Pipe the PDF document to the response
      doc.pipe(res);
  
      // Add header
      doc.fontSize(20).fillColor('#f57c00').text('FRUITKHA', { align: 'center' });
      doc.fontSize(10).fillColor('#333').text('Fresh Fruits Online', { align: 'center' });
      doc.moveDown();
  
      // Add invoice details
      doc.fontSize(12).fillColor('#000').text(`Invoice No: INC${randomNumber}`);
      doc.text(`Order ID: ${order._id}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          year: 'numeric',
      })}`);
      doc.moveDown();
  
      // Add billing information
      doc.fontSize(14).text('Billing Information', { underline: true });
      doc.fontSize(12).text(`Customer Name: ${order.UserID.firstName}`);
      doc.text(`Email: ${order.UserID.email}`);
      doc.text(`Phone: ${order.UserID.phone}`);
      doc.text(`Address: ${order.addressId.District}, ${order.addressId.State}, ${order.addressId.PIN}`);
      doc.moveDown();
  
      // Add order summary
      doc.fontSize(14).text('Order Summary', { underline: true }).moveDown();
  
      // Table header
      const headers = ['Item Name', 'Quantity', 'Unit Price', 'Status', 'Total'];
      const tableTop = doc.y;
      const colWidths = [150, 50, 80, 80, 80];
  
      let x = 50;
      headers.forEach((header, i) => {
          doc.fontSize(12).font('Helvetica-Bold').text(header, x, tableTop, { width: colWidths[i], align: 'center' });
          x += colWidths[i];
      });
  
      // Draw a line below headers
      doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();
      let currentY = tableTop + 25;
  
      // Table rows
      order.Products.forEach((item) => {
          x = 50;
          const row = [
              item.product.productTitle,
              item.quantity,
              `₹${item.Price}`,
              item.status,
              `₹${item.TOTAL}`,
          ];
  
          row.forEach((data, i) => {
              doc.fontSize(12).font('Helvetica').text(data, x, currentY, { width: colWidths[i], align: 'center' });
              x += colWidths[i];
          });
          currentY += 20; // Row height
      });
  
      // Add totals below the table
      currentY += 10;
      doc.moveTo(50, currentY).lineTo(530, currentY).stroke(); // Line above totals
      currentY += 5;
  
      const totals = [
          { label: 'Subtotal', value: `₹${order.subTotal}` },
          { label: 'GST ', value: `₹${order.GST}` },
          { label: 'Shipping Fee', value: `₹${order.Shipping}` },
          { label: 'Discount Value', value: `₹${order.Coupon.discountValue}` },
          { label: 'Total Amount', value: `₹${order.Final_Amount}` },
      ];
  
      totals.forEach((total) => {
          doc.fontSize(12).text(total.label, 400, currentY, { align: 'left' });
          doc.text(total.value, 50, currentY, { align: 'right' });
          currentY += 20;
      });
  
      // Add payment details
      doc.moveDown().fontSize(14).text('Payment Details', { underline: true }).moveDown();
      doc.fontSize(12).text(`Payment Method: ${order.payment}`);
      if (order.payment === 'razorpay') {
          doc.text(`Transaction ID: ${order.RazorPay.razorpay_payment_id}`);
      }
  
      // Add footer
      doc.moveDown().fontSize(10).fillColor('#555').text('For any questions, contact us at support@fruitkha.com', { align: 'center' });
      doc.text('Thank you for shopping with us! 🍇', { align: 'center' });
  
      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
};


  

module.exports={
    checkout,
    placeOrder,
    razorPay,
    verifyPayment,
    retryPayment,
    success,
    invoice
   

}