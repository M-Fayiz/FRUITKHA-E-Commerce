const express=require('express')
const router=express.Router()
const Auth=require('../middleware/auth')

const user_Contrl=require('../controller/userCntrl')
const passport = require('passport')
const PROFILE=require('../controller/Profile')

router.get('/signUp',Auth.userAuth,user_Contrl.loadSignUp)
// router.post('/signup',user_Contrl.registration)

router.get('/',Auth.blockUser,user_Contrl.LoadHome)

router.post('/genarateOTP',user_Contrl.generateOTP)
router.get('/getOTP',user_Contrl.Loadotp)
router.post('/resendOTP',user_Contrl.resendOTP)
router.post('/verifyOTP',user_Contrl.verifyOTP)

// < ------ PROFILE ----------->
router.get('/profile/:id',PROFILE.LoadProfile)
router.patch('/editProfile',PROFILE.editProfile)
router.patch('/change-Password',PROFILE.ChangePass)

router.get('/login',Auth.userAuth,user_Contrl.getlogin)
router.post('/verify_lagin',user_Contrl.Login)
router.get('/logOut/:id',user_Contrl.logOut)

router.get('/reset',user_Contrl.Reset)
router.get('/email',user_Contrl.email)

router.post('/verify-mail',user_Contrl.verifyEmail)

// router.post('/forgetPASS',user_Contrl.forgotpass)

router.post('/createOTP',user_Contrl.createOTP)

router.post('/forPassword',user_Contrl.forPassword)

router.get('/auth/google',Auth.userAuth,passport.authenticate('google',{scope:['profile','email']}))

router.get('/auth/google/callback',Auth.userAuth,passport.authenticate('google',{failureRedirect:'/signUp'}),(req,res)=>{
    req.session.user=true
    
    res.redirect('/')
})


router.get('/shop',user_Contrl.shop)

// router.get('/singleProduct',user_Contrl.singleProduct)

router.get('/product/:id',user_Contrl.productId)


router.get('/search',user_Contrl.search)
router.get('/ALL',user_Contrl.ALL)

module.exports=router   