const PRODUCT=require('../../model/ADMIN/product')

const stock=async(req,res)=>{
    try {
    
        const Product=await PRODUCT.find({})

        res.render('admin/Stock',{CURRENTpage:'stock',Product})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    stock
}