const USER=require('../../model/User/userModel')
const CART=require('../../model/User/CART')
const ADDRESS=require('../../model/User/address')
const PRODUCT=require('../../model/ADMIN/product')
const ORDER=require('../../model/ADMIN/Order-schema')
const COUPON=require('../../model/ADMIN/Coupon')

const checkout = async (req, res) => {
    console.log('- - - LOG CHECKED - - -')
    try {
      const UserID = req.session.user;
  
      console.log(UserID)
      const address = await ADDRESS.find({UserID});
      const cart = await CART.findOne({ UserID:UserID }).populate('Products.productId')
      const coupon=await COUPON.find({status:'Active'})
      if (!address) {
        
        res.render('user/checkout', {
          CURRENTpage: 'checkout',
          user: req.session.user,
          address: [],
          info: 'No Address Added Yet',
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
          coupon
        });
      }
    } catch (error) {
      
      console.error('Error in checkout:', error);
      res.status(500).send('Something went wrong. Please try again later.');
    }
  };


  const placeOrder = async (req, res) => {
    console.log('Processing Place Order Request...');
    try {
      const { selectedAddress, paymentMethod } = req.body;
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
      let couponId = cart.Discount.discountId;
      if (cart.Discount && cart.Discount.discountId) {
        const coupon = await COUPON.findById(cart.Discount.discountId);
  
        if (coupon) {
          const now = new Date();
          if (coupon.status === 'Active' && now >= coupon.startDate && now <= coupon.endDate) {
            if (coupon.minCartValue && cart.subTotal >= coupon.minCartValue) {
              discountValue = cart.Discount.discount_amount;
              couponCode = coupon.code;
            } else {
              console.log('Coupon validation failed: Minimum cart value not met.');
            }
          } else {
            console.log('Coupon validation failed: Coupon is expired or inactive.');
          }
        } else {
          console.log('Coupon not found in the system.');
        }
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
        addressId: {
          address: address.Address_name,
          Name: address.Name,
          PIN: address.PIN,
          place: address.place,
          mark: address.mark,
          District: address.District,
          State: address.State,
        },
      };
  
      const newOrder = new ORDER(orderData);
      await newOrder.save();
  
      // Decrease the stock of products in the cart
      for (const item of cart.Products) {
        const product = await PRODUCT.findById(item.productId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
        }
  
        if (product.Stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name}`,
          });
        }
  
        product.Stock -= item.quantity;
        await product.save();
      }
  
      // Clear the cart after placing the order
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
  
  
  

module.exports={
    checkout,
    placeOrder
}