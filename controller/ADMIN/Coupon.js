const COUPON=require('../../model/ADMIN/Coupon')
const USER=require('../../model/User/userModel')
const CART=require('../../model/User/CART')
// const check = async()=>{
//     console.log(await USER.find({email: "shahan@gmail.com"}))
// }
// check()

const coupon=async(req,res)=>{
    try {
        const coupon= await COUPON.find({})
        res.render('admin/coupon',{CURRENTpage:'coupon',coupon})
    } catch (error) {
        console.log(error.message)
    }
    
}

const addCoupon=async(req,res)=>{
    console.log(' - - ADD COUPON - - ');
    
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
         minCartValue
    }=req.body
 
    const check=await COUPON.findOne({code:couponCode})
     if(check){
        return res.json({success:false,message:'Coupon Exist with THIS CODE'})
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
        minCartValue: minCartValue
    })
   const data=await result.save()
   if(data){
    return res.status(200).json({success:true,message:'Coupon Added Succesfully'})
   }
 
   } catch (error) {
    console.log(error.message);
    return res.status(500).json({success:false,message:'Internal Error'})
   }


}

const editCoupon = async (req, res) => {
    console.log("- - EDIT COUPON - -");

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
        } = req.body;

        console.log("Request Body:", req.body);

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
        },{new:true});
        console.log(coupon,'coupon');
        
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon Not Found" });
        }

       

        res.status(200).json({ success: true, message: "Coupon Successfully Updated", data: coupon });
    } catch (error) {
        console.error("Error:", error.message);

        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const couponValidate = async (req, res) => {
    console.log("VALIDATE COUPON");
    try {
      const { coupon, userId, total } = req.body;
      console.log(coupon, userId, total);
      let TOTAL = Number(total);
  
      const result = await COUPON.findOne({ code: coupon });
      if (!result) {
        return res.status(400).json({ success: false, message: "Invalid Coupon Code" });
      }
  
      console.log('result', result.code);
  
      if (result.status !== "Active") {
        return res.status(400).json({ success: false, message: "Coupon is not active." });
      }
  
      const now = new Date();
      if (now < result.startDate || now > result.endDate) {
        return res.status(400).json({ success: false, message: "This coupon is expired or not active yet." });
      }
  
      if (result.maxUses > 0 && result.uses >= result.maxUses) {
        return res.status(400).json({ success: false, message: "This coupon has been fully redeemed." });
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
          return res.status(400).json({
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
        return res.status(400).json({
          success: false,
          message: `Minimum cart value must be at least ${result.minCartValue}.`,
        });
      }
  
      let discount = 0;
      if (result.Type === "Percentage") {
        discount = (TOTAL * result.Value) / 100;
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
  
      result.uses += 1;
      if (result.maxUses > 0 && result.uses >= result.maxUses) {
        result.status = "Expired";
      }
  
      await result.save();
      await cart.save();
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "Coupon applied successfully!",
        discount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
  };
  
  

const remove = async (req, res) => {
    console.log('GET IN REMOVE COUPON');
    try {
      const { couponId, userId } = req.body;
  
      const user = await USER.findById(userId);
      if (!user) {
        return res.status(400).json({ success: false, message: 'User Not Found' });
      }
  
      const couponIndex = user.usedCoupon.findIndex(c => c.coupon.toString() === couponId.toString());
      if (couponIndex === -1) {
        return res.status(400).json({ success: false, message: 'Coupon not found in user history.' });
      }
  
      user.usedCoupon.splice(couponIndex, 1);
  
      const cart = await CART.findOne({ UserID: userId });
      if (!cart) {
        return res.status(400).json({ success: false, message: 'Cart not found.' });
      }
  
      cart.Discount = { discount_amount: 0, discountId: null };
      cart.subTotal = cart.Products.reduce((sum, product) => sum + product.quantity * product.Price, 0) 
  
      await user.save();
      await cart.save();
  
      return res.status(200).json({
        success: true,
        message: 'Coupon removed successfully. Discount has been reset.',
        cart,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
  


module.exports={
    coupon,
    addCoupon,
    editCoupon,
    couponValidate,
    remove
}