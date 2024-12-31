const express=require('express')
const Router=express.Router()
const admin_Cntrl=require('../controller/ADMIN/adminCntrl')
const upload=require('../utils/multer')
const product_CNTRL=require('../controller/ADMIN/productCntrl')
const OFFER=require('../controller/ADMIN/OFFER')
const ORDER=require('../controller/ADMIN/order')
const STOCK=require('../controller/ADMIN/Stock')
const COUPON=require('../controller/ADMIN/Coupon')
const REPORT=require('../controller/ADMIN/SalesReport')
const adminAuth=require('../middleware/auth')
const GRAPH=require('../controller/ADMIN/graph')

// Login.,.,.,.,
Router.get('/login',admin_Cntrl.LoadLogin)
Router.post('/verify_login',admin_Cntrl.verifyLogin)

// Home,.,.,.,...
Router.get('/',adminAuth.adminAuth,admin_Cntrl.LoadHome)

// User List
Router.get('/userList',adminAuth.adminAuth,admin_Cntrl.Load_User)
Router.patch('/toogleUserStatus',admin_Cntrl.toogleUserStatus)

// For Category
Router.post('/addCategory',upload.single('image'),admin_Cntrl.addCategory)
Router.get('/category',adminAuth.adminAuth,admin_Cntrl.LoadCategory)

Router.post('/clear-offer',admin_Cntrl.clearOffer)
// 
// Router.patch('/addSub',admin_Cntrl.AddSub)
Router.patch('/categoryStatus',admin_Cntrl.categoryStatus)
Router.patch('/EditCategory',upload.single('image'),admin_Cntrl.EditCategory)


//  PRODUCT |  PRODUCT |  PRODUCT |
Router.get('/product',adminAuth.adminAuth,product_CNTRL.productForm)
Router.post('/addProduct',upload.array("primaryImageInput",3),product_CNTRL.addProduct)

// PRODUCT LIST ---------------

Router.get('/productList',adminAuth.adminAuth,product_CNTRL.prductList)
Router.patch('/productList',product_CNTRL.productList)
Router.get('/SingleImage/:id',adminAuth.adminAuth,product_CNTRL.getSingle)
Router.patch('/updateProduct',upload.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'additionalImage0', maxCount: 1 },
    { name: 'additionalImage1', maxCount: 1 },
]),product_CNTRL.editProduct)





//  |  OFFER  |  OFFER  |  OFFER  |  OFFER 
Router.post('/clearOffer',OFFER.removeOFF)
Router.post('/addOffer',OFFER.addOffer)
Router.get('/Offer',adminAuth.adminAuth,OFFER.getOffer)

// ORDER | ORDER | ORDER | ORDER ORDER ORDER 
Router.get('/order',adminAuth.adminAuth,ORDER.order)
Router.get('/order-details/:id',ORDER.details)
Router.put('/OrderStatus',ORDER.OrderStatus)
Router.post('/response',ORDER.ReturnHandle)
Router.post('/productRes',ORDER.ReturnHandle)

//  |   STOCK   |   STOCK   |   STOCK

Router.get('/stock',adminAuth.adminAuth,STOCK.stock)
Router.post('/addStock',STOCK.addQuantity)

//  | COUPON | COUPON | COUPON | COUPON

Router.get('/coupon',adminAuth.adminAuth,COUPON.coupon)
Router.post('/addCoupon',COUPON.addCoupon)
Router.patch('/editCoupon',COUPON.editCoupon)
Router.post('/removeCoupon',COUPON.deletCoupon)

// SALES REPORT  |  SALES REPORT  |  SALES REPORT

Router.get('/generoteReport',adminAuth.adminAuth,REPORT.salesReport) 

Router.post('/get-sales-report',REPORT.genorate)

// GRAPH  ||   GRAPH   ||   GRAPH   ||   GRAPH   |

Router.post('/graph',adminAuth.adminAuth,GRAPH.graph)


module.exports=Router