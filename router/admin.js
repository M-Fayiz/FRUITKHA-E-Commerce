const express=require('express')
const Router=express.Router()
const admin_Cntrl=require('../controller/ADMIN/adminCntrl')
const upload=require('../utils/multer')
const product_CNTRL=require('../controller/ADMIN/productCntrl')
const OFFER=require('../controller/ADMIN/OFFER')
const ORDER=require('../controller/ADMIN/order')
const STOCK=require('../controller/ADMIN/Stock')
const COUPON=require('../controller/ADMIN/Coupon')

const adminAuth=require('../middleware/auth')


// Login.,.,.,.,
Router.get('/login',admin_Cntrl.LoadLogin)
Router.post('/verify_login',admin_Cntrl.verifyLogin)

// Home,.,.,.,...
Router.get('/',admin_Cntrl.LoadHome)

// User List
Router.get('/userList',admin_Cntrl.Load_manage)
Router.patch('/toogleUserStatus',admin_Cntrl.toogleUserStatus)


// For Category
Router.post('/addCategory',upload.single('image'),admin_Cntrl.addCategory)
Router.get('/category',admin_Cntrl.LoadCategory)

Router.post('/clear-offer',admin_Cntrl.clearOffer)
// 
// Router.patch('/addSub',admin_Cntrl.AddSub)
Router.patch('/categoryStatus',admin_Cntrl.categoryStatus)
Router.patch('/EditCategory',upload.single('image'),admin_Cntrl.EditCategory)


//  PRODUCT *************
Router.get('/product',product_CNTRL.productForm)
// 
Router.post('/addProduct',upload.array("primaryImageInput",3),product_CNTRL.addProduct)

// PRODUCT LIST ---------------

Router.get('/productList',product_CNTRL.prductList)
// 

Router.get('/SingleImage/:id',product_CNTRL.getSingle)

Router.patch('/updateProduct',upload.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'additionalImage0', maxCount: 1 },
    { name: 'additionalImage1', maxCount: 1 },
]),product_CNTRL.editProduct)



Router.patch('/productList',product_CNTRL.productList)

Router.post('/clearOffer',OFFER.removeOFF)

Router.post('/addOffer',OFFER.addOffer)

Router.get('/Offer',OFFER.getOffer)

// ORDER | ORDER | ORDER | ORDER ORDER ORDER 
Router.get('/order',ORDER.order)
Router.get('/order-details/:id',ORDER.details)
Router.put('/OrderStatus',ORDER.OrderStatus)

//  |   STOCK   |   STOCK   |   STOCK

Router.get('/stock',STOCK.stock)

//  | COUPON | COUPON | COUPON | COUPON

Router.get('/coupon',COUPON.coupon)
Router.post('/addCoupon',COUPON.addCoupon)
Router.patch('/editCoupon',COUPON.editCoupon)
module.exports=Router