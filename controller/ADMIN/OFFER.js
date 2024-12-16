const PRODUCT=require('../../model/ADMIN/product')
const category=require('../../model/ADMIN/category')
const OFFER=require('../../model/ADMIN/Offer')


const removeOFF = async (req, res) => {
    try {
        const { OfferID } = req.body

        if (!OfferID) {
            return res.status(400).json({ success: false, message: "OfferID is required" })
        }

        console.log("Removing offer with ID:", OfferID)

        const result = await OFFER.findByIdAndDelete(OfferID)

        if (!result) {
            return res.status(404).json({ success: false, message: "Offer not found" })
        }

        console.log("Offer deleted - Product ID:", result.productId)
        console.log("Offer deleted - Category ID:", result.categoryId)

        if (result.categoryId) {
            const updatedCategory = await category.findByIdAndUpdate(
                result.categoryId,
                { $unset: { Offer: "" } }
            )

            if (!updatedCategory) {
                return res.status(404).json({ success: false, message: "Category not found for the given offer" })
            }

            

            await PRODUCT.updateMany(
                { Category: updatedCategory.category },
                { $unset: { "Offer.OfferPrice": "", "Offer.OfferId": "" } }
            )

            return res.status(200).json({ success: true, message: "Category offer removed successfully" })
        } else if (result.productId) {
            const updatedProduct = await PRODUCT.findByIdAndUpdate(
                result.productId,
                { $unset: { "Offer.OfferPrice": "", "Offer.OfferId": "" } }
            )

            if (!updatedProduct) {
                return res.status(404).json({ success: false, message: "Product not found for the given offer" })
            }

            console.log("Product offer removed successfully:", updatedProduct)

            return res.status(200).json({ success: true, message: "Product offer removed successfully" })
        } else {
            return res.status(400).json({ success: false, message: "Invalid offer: No categoryId or productId found" })
        }
    } catch (error) {
        console.error("Error in removeOFF:", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}



const addOffer = async (req, res) => {
  console.log('Enter add offer')
  try {
      const { categoryID, offerPercentage, offerDescription, expiredAt, createdAt, productId } = req.body
       console.log(req.body)
   

      let savedOffer

      if (categoryID) {
          const CATEGORY = await category.findById(categoryID)
          if (!CATEGORY) {
              return res.status(404).json({ success: false, message: "Category not found" })
          }

          const duplicateOffer = await OFFER.findOne({ categoryId: categoryID })
          if (duplicateOffer) {
              return res.status(400).json({ success: false, message: "offer for this category already exists" })
          }

          savedOffer = new OFFER({
              offer: offerPercentage,
              categoryId: categoryID,
              description: offerDescription,
              CreatedAt: createdAt,
              expiredAt: expiredAt,
          })
          await savedOffer.save()

          const productsInCategory = await PRODUCT.find({ Category: CATEGORY.category })
          for (const product of productsInCategory) {
              const discount = (product.RegulerPrice * offerPercentage) / 100
              const offerPrice = product.RegulerPrice - discount
              await PRODUCT.updateOne(
                  { _id: product._id },
                  { $set: { 'Offer.OfferPrice': offerPrice, 'Offer.OfferId': savedOffer._id } }
              )
          }

          await category.findByIdAndUpdate(categoryID, { Offer: savedOffer._id })
      } else if (productId) {
          const product = await PRODUCT.findById(productId)
          if (!product) {
              return res.status(404).json({ success: false, message: "Product not found" })
          }

          const discount = (product.RegulerPrice * offerPercentage) / 100
          const offerPrice = product.RegulerPrice - discount


          const duplicateOffer = await OFFER.findOne({ productId: productId })
          if (duplicateOffer) {
              return res.status(400).json({ success: false, message: "offer for this product already exists" })
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

      res.json({ success: true, message: "Offer added successfully" })
  } catch (error) {
      console.error('Error:', error.message)
      res.status(500).json({ success: false, message: error.message })
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