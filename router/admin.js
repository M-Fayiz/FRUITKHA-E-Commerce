const express=require('express')
const Router=express.Router()
const admin_Cntrl=require('../controller/adminCntrl')
const upload=require('../utils/multer')
const product_CNTRL=require('../controller/productCntrl')
const OFFER=require('../controller/OFFER')

const adminAuth=require('../middleware/auth')


// Login.,.,.,.,
Router.get('/login',admin_Cntrl.LoadLogin)
Router.post('/verify_login',admin_Cntrl.verifyLogin)

// Home,.,.,.,...
Router.get('/',adminAuth.adminAuth,admin_Cntrl.LoadHome)

// User List
Router.get('/userList',admin_Cntrl.Load_manage)
Router.patch('/toogleUserStatus',admin_Cntrl.toogleUserStatus)


// For Category
Router.post('/addCategory',upload.single('image'),admin_Cntrl.addCategory)
Router.get('/category',adminAuth.adminAuth,admin_Cntrl.LoadCategory)

Router.post('/clear-offer',admin_Cntrl.clearOffer)
// 
// Router.patch('/addSub',admin_Cntrl.AddSub)
Router.patch('/categoryStatus',admin_Cntrl.categoryStatus)
Router.patch('/EditCategory',upload.single('image'),admin_Cntrl.EditCategory)


//  PRODUCT *************
Router.get('/product',adminAuth.adminAuth,product_CNTRL.productForm)
// 
Router.post('/addProduct',upload.array("primaryImageInput",3),product_CNTRL.addProduct)

// PRODUCT LIST ---------------

Router.get('/productList',adminAuth.adminAuth,product_CNTRL.prductList)
// 

Router.get('/SingleImage/:id',adminAuth.adminAuth,product_CNTRL.getSingle)

Router.patch('/updateProduct',upload.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'additionalImage0', maxCount: 1 },
    { name: 'additionalImage1', maxCount: 1 },
]),product_CNTRL.editProduct)



Router.patch('/productList',product_CNTRL.productList)

Router.post('/clearOffer',OFFER.removeOFF)

Router.post('/addOffer',OFFER.addOffer)

Router.get('/Offer',adminAuth.adminAuth,OFFER.getOffer)

module.exports=Router