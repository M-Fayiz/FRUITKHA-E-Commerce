const COUPON=require('../../model/admin/Coupon')
const USER=require('../../model/user/userModel')
const CART=require('../../model/user/CART')
const httpStatusCode = require('../../constant/httpStatusCode')
const httpResponse = require('../../constant/httpResponse')


const coupon=async(req,res)=>{
    try {
        const coupon= await COUPON.find({})
        res.status(httpStatusCode.OK).render('admin/coupon',{CURRENTpage:'coupon',coupon})
    } catch (error) {
        console.log(error.message)
    }
    
}

const addCoupon=async(req,res)=>{

    
   try {
    const {
         couponCode,
         description,
         couponType,
         couponValue,
         startDate,
         endDate,
         maxUses,
         usedPerUser,
         minCartValue,
         maxDiscount
    }=req.body
 
    const check=await COUPON.findOne({code:couponCode})
     if(check){
        return res.status(httpStatusCode.ITEM_EXIST).json({success:false,message:httpResponse.COUPON_EXIST})
     }
    
    
    const result= new COUPON({
        code: couponCode,
        Description:description,
        Type: couponType,
        Value: couponValue,
        startDate: startDate,
        endDate: endDate,
        maxUses: maxUses,
        usedPerUser: usedPerUser,
        minCartValue: minCartValue,
        maxDiscount:maxDiscount
    })
   const data=await result.save()
   if(data){
    return res.status(httpStatusCode.OK).json({success:true,message:httpResponse.COUPON_ADDED})
   }
 
   } catch (error) {
    console.log(error.message);
    return res.status(httpStatusCode.SERVER_ERROR).json({success:false,message:httpResponse.SERVER_ERROR})
   }


}

const editCoupon = async (req, res) => {


    try {
        const {
            id,
            code,
            Description,
            type,
            value,
            startDate,
            endDate,
            maxUses,
            usedPerUser,
            minCartValue,
            maxDiscount
            
        } = req.body;

       

        // Find the coupon by ID
        const coupon = await COUPON.findByIdAndUpdate( id ,{
            id,
            code,
            Description,
            type,
            Value: value,
            startDate,
            endDate,
            maxUses,
            usedPerUser,
            minCartValue,
            maxDiscount,
            status:'Active'
        },{new:true});
     
        
        if (!coupon) {
            return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message:httpResponse.ITEM_NOT_FOUND('Coupon') });
        }

       

        res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.UPDATED_SUCCESSFULLY('Coupon','updated'), data: coupon });
    } catch (error) {
        console.error("Error:", error.message);

        if (error.name === "ValidationError") {
            return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: error.message });
        }

        res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.SERVER_ERROR});
    }
}

const couponValidate = async (req, res) => {

    try {
      const { coupon, userId, total } = req.body;

      let TOTAL = Number(total);
  
      const result = await COUPON.findOne({ code: coupon });
      if (!result) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.INVALID_COUPON });
      }
  
  
  
      if (result.status !== "Active") {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.Coupon_not_active });
      }
      
      const now = new Date();
      if (now < result.startDate ||now > result.endDate) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: "This coupon is expired or not active yet." });
      }
  
      if (result.maxUses > 0 && result.uses >= result.maxUses) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: "This coupon has been fully redeemed." });
      }
  
      const user = await USER.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      const cart = await CART.findOne({ UserID: userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found." });
      }
  
      const existingCoupon = user.usedCoupon.find(
        (couponItem) => couponItem.coupon.toString() === result._id.toString()
      );
  
      if (existingCoupon) {
        if (existingCoupon.usageCount >= result.usedPerUser) {
          return res.status(httpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "You have already used this coupon the maximum allowed times.",
          });
        }
        existingCoupon.usageCount += 1; 
      } else {
        user.usedCoupon.push({
          coupon: result._id, 
          usageCount: 1, 
        });
      }
  
      if (result.minCartValue && TOTAL < result.minCartValue) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: `Minimum cart value must be at least ${result.minCartValue}.`,
        });
      }
  
      let discount = 0;
      if (result.Type === "Percentage") {
        discount = (TOTAL * result.Value) / 100;
        if (result.maxDiscount && discount > result.maxDiscount) {
          discount = result.maxDiscount;
       }
      } else if (result.Type === "Fixed") {
        discount = result.Value;
      } else if (result.Type === "shipping_Offer") {
        discount = 40;
      }
  
      discount = Math.min(discount, TOTAL);
  
      cart.Discount = {
        discount_amount: discount,
        discountId: result._id,
      };
      cart.subTotal = TOTAL - discount + cart.Shipping;
  
      result.Uses += 1;
      if (result.maxUses > 0 && result.uses >= result.maxUses) {
        result.status = "Expired";
      }
  
      await result.save();
      await cart.save();
      await user.save();
  
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Coupon applied successfully!",
        discount,
      });
    } catch (error) {
      console.error(error);
      return res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: "Internal Server Error", error: error.message });
    }
  };
  
  

const remove = async (req, res) => {
    
    try {
      const { couponId, userId } = req.body;
  
      const user = await USER.findById(userId);
      if (!user) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: 'User Not Found' });
      }
  
      const couponIndex = user.usedCoupon.findIndex(c => c.coupon.toString() === couponId.toString());
      if (couponIndex === -1) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: 'Coupon not found in user history.' });
      }
  
      user.usedCoupon.splice(couponIndex, 1);
  
      const cart = await CART.findOne({ UserID: userId });
      if (!cart) {
        return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: 'Cart not found.' });
      }
  
      cart.Discount = { discount_amount: 0, discountId: null };
      cart.subTotal = cart.Products.reduce((sum, product) => sum + product.quantity * product.Price, 0) 
  
      await user.save();
      await cart.save();
  
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: 'Coupon removed successfully. Discount has been reset.',
        cart,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
  
const deletCoupon=async(req,res)=>{

   const {couponId}=req.body
      try {
        const result=await COUPON.findByIdAndDelete(couponId)
        if(result){
          return res.status(httpStatusCode.OK).json({success:true,message:httpResponse.ITEM_NOT_FOUND('coupon','removed')})
        }
      } catch (error) {
        console.log(error.message)
      }
}

module.exports={
    coupon,
    addCoupon,
    editCoupon,
    couponValidate,
    remove,
    deletCoupon
}