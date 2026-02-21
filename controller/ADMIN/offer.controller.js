const PRODUCT=require('../../model/admin/product')
const category=require('../../model/admin/category')
const OFFER=require('../../model/admin/Offer')
const mongoose=require('mongoose')
const httpStatusCode = require('../../constant/httpStatusCode')
const httpResponse = require('../../constant/httpResponse')

const removeOFF = async (req, res) => {
    try {
        const { OfferID } = req.body

        if (!OfferID) {
            return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.OFFER_ID_REQUIRED })
        }

       

        const result = await OFFER.findByIdAndDelete(OfferID)

        if (!result) {
            return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.OFFER_NOT_FOUND })
        }

        

        if (result.categoryId) {
            const updatedCategory = await category.findByIdAndUpdate(
                result.categoryId,
                { $unset: { Offer: "" } }
            )

            if (!updatedCategory) {
                return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.CATEGORY_NOT_FOUND_FOR_OFFER })
            }

            

            await PRODUCT.updateMany(
                { Category: result.categoryId },
                { $unset: { "Offer.OfferPrice": "", "Offer.OfferId": "" } }
            )

            return res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.CATEGORY_OFFER_REMOVED })
        } else if (result.productId) {
            const updatedProduct = await PRODUCT.findByIdAndUpdate(
                result.productId,
                { $unset: { "Offer.OfferPrice": "", "Offer.OfferId": "" } }
            )

            if (!updatedProduct) {
                return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND_FOR_OFFER })
            }

         

            return res.status(httpStatusCode.OK).json({ success: true, message: httpResponse.PRODUCT_OFFER_REMOVED })
        } else {
            return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.INVALID_OFFER_TARGET })
        }
    } catch (error) {
        console.error("Error in removeOFF:", error.message)
        return res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.SERVER_ERROR, error: error.message })
    }
}



const addOffer = async (req, res) => {

  try {
      const { categoryID, offerPercentage, offerDescription, expiredAt, createdAt, productId } = req.body
       console.log(req.body)
    

      let savedOffer

      if (categoryID) {
          const CATEGORY = await category.findById(categoryID)
          if (!CATEGORY) {
              return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.CATEGORY_NOT_FOUND })
          }

          const duplicateOffer = await OFFER.findOne({ categoryId: categoryID })
          if (duplicateOffer) {
              return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.CATEGORY_OFFER_EXISTS })
          }

          savedOffer = new OFFER({
              offer: offerPercentage,
              categoryId: categoryID,
              description: offerDescription,
              CreatedAt: createdAt,
              expiredAt: expiredAt,
          })
         
          let categoryIdd=new mongoose.Types.ObjectId(categoryID);
       
          const productsInCategory = await PRODUCT.find({ Category: categoryIdd })
         
          
          for (const product of productsInCategory) {
              const discount = (product.RegulerPrice * offerPercentage) / 100
              const offerPrice = product.RegulerPrice - discount
              await PRODUCT.updateOne(
                  { _id: product._id },
                  { $set: { 'Offer.OfferPrice': offerPrice, 'Offer.OfferId': savedOffer._id } }
              )
          }
          await savedOffer.save()
          await category.findByIdAndUpdate(categoryID, { Offer: savedOffer._id })
      } else if (productId) {
          const product = await PRODUCT.findById(productId)
          if (!product) {
              return res.status(httpStatusCode.ITEM_NOT_FOUND).json({ success: false, message: httpResponse.PRODUCT_NOT_FOUND })
          }

          const discount = (product.RegulerPrice * offerPercentage) / 100
          const offerPrice = product.RegulerPrice - discount


          const duplicateOffer = await OFFER.findOne({ productId: productId })
          if (duplicateOffer) {
              return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: httpResponse.PRODUCT_OFFER_EXISTS })
          }
          savedOffer = new OFFER({
              offer: offerPercentage,
              productId: productId,
              description: offerDescription,
              CreatedAt: createdAt,
              expiredAt: expiredAt,
          })
          await savedOffer.save()

          await PRODUCT.updateOne(
              { _id: product._id },
              { $set: { 'Offer.OfferPrice': offerPrice, 'Offer.OfferId': savedOffer._id } }
          )
      }

      res.status(httpStatusCode.CREATED).json({ success: true, message: httpResponse.OFFER_ADDED })
  } catch (error) {
   
      res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: error.message })
  }
}

  
 const getOffer = async(req,res)=>{
    try {
        const Category= await category.find()
        const Products=await PRODUCT.find()
        const categoryOffer=await OFFER.find({categoryId:{$exists:true}}).populate('categoryId')
        const productOffer=await OFFER.find({productId:{$exists:true}}).populate('productId')

        res.render('admin/Offer',{CURRENTpage:'offer',categoryOffer,Category,Products,productOffer})
    } catch (error) {
        console.log(error)   
    }
    
 }

module.exports={
    removeOFF,
    addOffer,
    getOffer

}
