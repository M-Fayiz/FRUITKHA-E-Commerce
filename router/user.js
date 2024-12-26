const express=require('express')
const router=express.Router()
const Auth=require('../middleware/auth')
const USER=require('../model/User/userModel')

const user_Contrl=require('../controller/USER-CNTRL/userCntrl')
const passport = require('passport')
const PROFILE=require('../controller/USER-CNTRL/Profile')
const ADDRES=require('../controller/USER-CNTRL/AddresCNTRL')
const CART=require('../controller/USER-CNTRL/CART')
const CHECKOUT=require('../controller/USER-CNTRL/CHECK-OUT')
const WISHLIST=require('../controller/USER-CNTRL/wishList')
const COUPON=require('../controller/ADMIN/Coupon')
const ORDER=require('../controller/ADMIN/order')
const WALLET=require('../controller/USER-CNTRL/wallet')
const userOrder=require('../controller/USER-CNTRL/userOrder')


router.get('/signUp',Auth.userAuth,user_Contrl.loadSignUp)
// router.post('/signup',user_Contrl.registration)

router.get('/',Auth.blockUser,user_Contrl.LoadHome)


    // <---- OTP -- OTP-- OTP -- OTP  ---->
router.post('/genarateOTP',user_Contrl.generateOTP)
router.get('/getOTP',user_Contrl.Loadotp)
router.post('/resendOTP',user_Contrl.resendOTP)
router.post('/verifyOTP',user_Contrl.verifyOTP)


   // < ------ PROFILE ----PROFILE------->//
router.get('/profile/:id',PROFILE.LoadProfile)
router.patch('/editProfile',PROFILE.editProfile)
router.patch('/change-Password',PROFILE.ChangePass)


// < REST PASSWORD <><><>
router.get('/rest',PROFILE.rest)
router.post('/forgot-Password',PROFILE.forgotPAS)

router.get('/rest-Password',PROFILE.newpass)
router.post('/rest-Password',PROFILE.REST)

// ### ADDRES-- ADDRES-- ADDRES
router.get('/address',Auth.blockUser,Auth.sessionAuth,ADDRES.address)
router.post('/addADRS',ADDRES.addAddres)
router.delete('/delete-Adres',ADDRES.rm_adres)
router.patch('/editADRS',ADDRES.editAdddres)


  //<<< LOGIN LOGIN LOGIN >>>>//
router.get('/login',Auth.userAuth,user_Contrl.getlogin)
router.post('/verify_lagin',user_Contrl.Login)
router.get('/logOut/:id',user_Contrl.logOut)

// - - GOOGLE AUTH - - GOOGLE AUTH - - GOOGLE AUTH - -
router.get('/auth/google',Auth.userAuth,passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',Auth.userAuth,passport.authenticate('google',{failureRedirect:'/signUp'}),async(req,res)=>{

    req.session.user=req.user._id
    console.log(`email of google user :- ${req.user._id}`)

    res.redirect('/')
})

router.get('/shop',Auth.blockUser,user_Contrl.shop)

router.get('/product/:id',user_Contrl.productId)

router.get('/search',user_Contrl.search)
router.get('/ALL',user_Contrl.ALL)


// $ | CART CART CART || CART CART CART |
router.get('/cart',Auth.blockUser,Auth.sessionAuth, CART.cart)
router.post('/addCart',CART.addCart)
router.post('/update-quantity',CART.updateCART)
router.post('/removeCart',CART.removeCart)

// | CHECK OUT  | CHECK OUT  | CHECK OUT  | CHECK OUT  
router.get('/checkout',Auth.blockUser,Auth.sessionAuth,CHECKOUT.checkout)
router.post('/placeOrder',CHECKOUT.placeOrder)
router.get('/success/:id',CHECKOUT.success)
router.get('/invoice/:id',CHECKOUT.invoice)

// = =  = ORDER LIST - - -- -
router.get('/orderList',Auth.blockUser,Auth.sessionAuth,userOrder.orderList)
router.get('/orderDetails/:id',Auth.sessionAuth,userOrder.orderDetails)

// |  CANCEL    |  CANCEL    |  CANCEL    |
router.post('/cancel-order',ORDER.handleProductAction)
router.post('/order-cancel',userOrder.CANCELallORDER)

// |   RETURN   |   RETURN   |   RETURN   |
router.post('/return-Order',userOrder.ReturnOrder)
router.post('/req-return',userOrder.productReturn)

//   WISH LIST
router.get('/wishList',Auth.blockUser,Auth.sessionAuth,WISHLIST.wishList)
router.post('/toggleWishList',WISHLIST.toggleWishList)
router.post('/remove-wishList',WISHLIST.remove_wishList)

// | COUPON VALID  | COUPON VALID  | COUPON VALID  |
router.post('/couponDetails',COUPON.couponValidate)
router.post('/remove-coupon',COUPON.remove)

//  |  Razor Pay  |  Razor Pay  |  Razor Pay  
router.post('/create-order',CHECKOUT.razorPay)
router.post('/verify-payment', CHECKOUT.verifyPayment)
router.post('/retry-payment',CHECKOUT.retryPayment)
// router.post('/verifyRetry',CHECKOUT.verifyRetry)

//  |  WALLET  |  WALLET  |  WALLET    WALLET  |
router.get('/wallet',WALLET.wallet)

module.exports=router   