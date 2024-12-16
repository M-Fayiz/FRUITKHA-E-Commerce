const adminModel=require('../../model/ADMIN/adminModel')
const USER=require('../../model/User/userModel')

const category=require('../../model/ADMIN/category');
const { response } = require('express');

const PRODUCT=require('../../model/ADMIN/product');
const categoryModel = require('../../model/ADMIN/category');


const addProduct = async (req, res) => {
    console.log(req.files);
    
    try {
        const { title, description, regularPrice, expiryDate, quantity, category, subCategories } = req.body;
     console.log(regularPrice)
        const batch_id = `batch_${new Date().getTime()}`;
        // const OFFER=regularPrice*(1-offerPrice/100)
        console.log(title);
       
        const test = await PRODUCT.findOne({
            productTitle: { $regex: new RegExp('^' + title + '$', 'i') }  
          });
              if(test){
                  return res.json({success:false,message:'Product Exist with This Title'})
              }
        
        console.log('tesgg',test);
       
        if (test) {
            return res.json({ success: false, message: "Product Already Exists" });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.json({ success: false, message: "Upload at least one image" }); // Added return statement
        }

        const image = req.files ? (Array.isArray(req.files) ? req.files.map((file) => file.filename) : [req.files.filename]) : [];

        console.log(image);
        console.log('files', req.files);

        const primaryImage = image[0];
        const additionalImage = image.slice(1); // Fixed typo

        const DATA = new PRODUCT({
            productTitle: title,
            description: description,
            RegulerPrice: regularPrice, 
            // ExpirAt: expiry,
            Stock: [{ batchId: batch_id, quantity, expiryDate }],
            Category: category,
            primaryImage: primaryImage,
            additonalImage: additionalImage, 
            subCategory: subCategories
        });
        const totalStock = DATA.Stock.reduce((acc, batch) => acc + batch.quantity, 0);
        DATA.totalStock = totalStock;

        await DATA.save();

        console.log('Product added successfully');
        res.json({ success: true, message: "Product added successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


// RENDERING <><><><><>
const productForm=async(req,res)=>{
    try {
        const data=await categoryModel.find({})
        res.render('admin/product-form',{data,CURRENTpage:'productForm'})
    } catch (error) {
        
    }
    
}



const prductList = async (req, res) => {
    try {
        const CTGRY = await categoryModel.find({});
        const Category = req.query.category;
        const List=req.query.List
        const Offer=req.query.Offer
        const stock = Number(req.query.stock); 
        let query = {};
        
        // Add category filter
        if (Category) {
            query.Category = Category;
        }

        if(List){
            query.isList=List
        }

        if(Offer){
            query.OfferPrice={$ne:0}
        }
        
        // Add stock filter
        if (stock === 11) {
            query.Stock = { $gt: 10, $lt: 1000 };
        } else if (stock === 10) {
            query.Stock = { $gt: 0, $lte: 10 };
        } else if (stock === 0) {
            query.Stock = { $lte: 0 };
        }


        // Pagination logic
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = 6; // Products per page
        const skip = (page - 1) * limit;


        
        const products = await PRODUCT.find(query).skip(skip).limit(limit);

        const totalProducts = await PRODUCT.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

  
        if (skip >= totalProducts && totalProducts > 0) {
            return res.redirect('/admin/productList?page=' + totalPages);
        }

        // Render view
        res.render('admin/productList', { 
            products, 
            CTGRY, 
            currentPage: page, 
            totalPages, 
            totalProducts ,
            CURRENTpage:'productList'

        });

    } catch (error) {
        console.log(error.message, 'error');
    }
};


const getSingle=async(req,res)=>{
    // console.log('hello guyssssss')
    const productId=req.params.id
   
    try {
        const category=await categoryModel.find({})
        // console.log(productId);
        
        const result=await PRODUCT.findById(productId)
        let offer = null; 

        if (result.OfferPrice && result.OfferPrice < result.RegulerPrice) {
           
            offer = ((result.RegulerPrice - result.OfferPrice) / result.RegulerPrice) * 100;
        } else {
          
            offer = null;
        }
       

       
        res.render('admin/singleImage',{result,category,CURRENTpage:'singleProduct',offer:offer})
    } catch (error) {
        console.log(error.message,'errrr');
        
    }


}

const editProduct=async(req,res)=>{
console.log('get nin');

     try {
        const {title,description, regularPrice, offerPrice, category, stock,productId}=req.body
    //    console.log(req.body);
    //    console.log(req.files);
    console.log(offerPrice);
    let OFFER;

if (offerPrice) {
    OFFER = Number((regularPrice * (1 - offerPrice / 100)).toFixed(2)); 
}

    const test = await PRODUCT.findOne({
        productTitle: { $regex: new RegExp('^' + title + '$', 'i') }  ,
        _id: { $ne: productId } 
      });
          if(test){
              return res.json({success:false,message:'Product Exist with This Title'})
          }
    
    
          // Fetch the current product to get existing images
          const product = await PRODUCT.findById(productId);
          if (!product) {
              return res.json({ success: false, message: 'Product not found' });
          }
  
          // Prepare the update data
          let updateData = {
              productTitle: title,
              description: description,
              RegulerPrice: regularPrice,
              OfferPrice: OFFER,
              Stock: stock,
              Category: category,
          };
  
          // Handle primary image update
          if (req.files.primaryImage && req.files.primaryImage[0]) {
              updateData.primaryImage = req.files.primaryImage[0].filename;
          }
  
          // Handle additional images
          let updatedAdditionalImages = [...(product.additonalImage || [])]; // Clone existing additional images
  
          Object.keys(req.files).forEach((key) => {
              const match = key.match(/additionalImage(\d+)/); // Match keys like 'additionalImage0'
              if (match) {
                  const index = parseInt(match[1], 10); // Extract index from 'additionalImageX'
                  if (req.files[key][0] && req.files[key][0].filename) {
                      updatedAdditionalImages[index] = req.files[key][0].filename; // Replace or insert at the specific index
                  }
              }
          });
  
          // Remove duplicates (if needed) and save updated images
          updateData.additonalImage = [...new Set(updatedAdditionalImages)];
  
          // Update the product in the database
          const result = await PRODUCT.findByIdAndUpdate(productId, updateData, { new: true });
          if (!result) {
              return res.json({ success: false, message: 'Failed to update product' });
          }
  
          res.json({ success: true, message: 'Product updated successfully', product: result });
          
        
     } catch (error) {
        console.log(error.message);
        
     }
}



const productList=async(req,res)=>{
    try {
        const {itemId,condition}=req.body
        console.log(itemId,condition);
        
      const result=await  PRODUCT.findByIdAndUpdate(itemId,{isList:condition})
      if(!result){
        return res.json({success:false,message:'result not recieved'})
      }
        res.json({success:true,message:"updated"})
        
    } catch (error) {
       res.json({success:false,message:error.message})
        
    }
}

module.exports={
    prductList,
    addProduct,
    productForm,
    getSingle,
    editProduct,
    productList,
   
    
}