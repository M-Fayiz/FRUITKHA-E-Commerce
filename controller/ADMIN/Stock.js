const PRODUCT=require('../../model/ADMIN/product')

const stock=async(req,res)=>{
    try {
    
        
        const products = await PRODUCT.find();

        const inventory = products.map((product) => ({
            id: product._id,
            productName: product.productTitle,
            category: product.Category,
            expiredQuantity: product.expiredQuantity,
            currentQuantity: product.totalStock,
        }));

        res.render('admin/Stock',{CURRENTpage:'stock',inventory})
    } catch (error) {
        console.log(error.message)
    }
}



const addQuantity=async(req,res)=>{
    console.log('add Quantity')
    try {
          const batch_id = `batch_${new Date().getTime()}`
        const {quantity,expiryDate,productId}=req.body
       console.log(quantity,expiryDate,productId)
          const product = await PRODUCT.findById(productId);
          if (!product) {
              return res.status(404).json({ success: false, message: "Product not found" });
          }
          product.Stock.push({
            batchId:batch_id,
            quantity,
            expiryDate,
        });
        //   const stockEntry = product.Stock.find((entry) => entry.expiryDate.toISOString() === new Date(expiryDate).toISOString());
  
        //   if (stockEntry) {
        //       // If the expiry date already exists, just update the quantity
        //       stockEntry.quantity += quantity;
        //   } else {
              // Otherwise, add a new stock entry
             
        //   }
  
          // Update the total stock
          product.totalStock += Number(quantity);
  
          // Save the updated product
          await product.save();
      res.status(200).json({success:true,messagee:'Stock Added'})

    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    stock,
    addQuantity
}