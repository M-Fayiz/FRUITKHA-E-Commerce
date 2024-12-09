const PRODUCT=require('../../model/ADMIN/product')
const category=require('../../model/ADMIN/category')
const OFFER=require('../../model/ADMIN/Offer')

const removeOFF = async (req, res) => {
    try {
        const { OfferID } = req.body;
        
        if (!OfferID) {
            return res.status(400).json({ success: false, message: "OfferID is required" });
        }
        
        console.log("Removing offer with ID:", OfferID);

        // Step 1: Delete the offer from the OFFER collection
        const result = await OFFER.findByIdAndDelete(OfferID);

        if (!result) {
            return res.status(404).json({ success: false, message: "Offer not found" });
        }

        console.log("Offer deleted successfully:", result);

       
        const updatedCategory = await category.findByIdAndUpdate(
            result.categoryName, 
            { Offer: null }      
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found for the given offer" });
        }

        console.log("Category updated successfully:", updatedCategory);

        
        const updatedProducts = await PRODUCT.updateMany(
            { Category: updatedCategory.category },
            { $unset: { OfferPrice: "" } }           
        );

        console.log("Products updated successfully:", updatedProducts);

        return res.status(200).json({
            success: true,
            message: "Category offer successfully removed",
            data: {
                offer: result,
                category: updatedCategory,
                affectedProducts: updatedProducts.modifiedCount,
            },
        });

    } catch (error) {
        console.error("Error in removeOFF:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


const addOffer = async (req, res) => {
    console.log('Enter add offer');
    try {
      const { categoryID, offerPercentage, offerDescription, expiredAt, createdAt, product } = req.body;
  
      if (!categoryID || categoryID.trim() === "") {
        return res.status(400).json({ success: false, message: "Category ID is required" });
      }
  
      console.log(req.body);
  
      // Find the category by ID
      const CATEGORY = await category.findById(categoryID);
      if (!CATEGORY) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
  
      console.log('Found category', CATEGORY);
  
      // Check for duplicate offers on the same category
      const duplicateOffer = await OFFER.findOne({ categoryName: categoryID });
      if (duplicateOffer) {
        return res.status(400).json({ success: false, message: "An offer for this category already exists" });
      }
  
      console.log('No duplicate offers');
  
      // Create and save the new offer
      const saveOffer = new OFFER({
        offer: offerPercentage,
        productName: product,
        categoryName: CATEGORY.id,
        description: offerDescription,
        CreatedAt: createdAt,
        expiredAt: expiredAt
      });
  
      const savedOffer = await saveOffer.save();
      console.log('Saved offer', savedOffer);
  
      if (savedOffer && savedOffer.categoryName) {
        
        const result = await PRODUCT.updateMany(
          { Category: CATEGORY.category }, 
          [
            {
              $set: {
                OfferPrice: {
                  $round: [
                    {
                      $multiply: ['$RegulerPrice', 1 - savedOffer.offer / 100]
                    },
                    2
                  ]
                },
                offerId: savedOffer._id // Link the offerId to the product
              }
            }
          ]
        );
  
        console.log('Update Result:', result);
  
        // Update the category to link the offer
        const updatedCategory = await category.findByIdAndUpdate(
          CATEGORY.id,
          { Offer: savedOffer._id }
        );
        console.log('Updated category:', updatedCategory);
      } else {
        return res.status(404).json({ success: false, message: "Category not found or invalid" });
      }
  
      res.json({ success: true, message: "Offer added successfully" });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
 const getOffer = async(req,res)=>{
    try {
        const catgry= await category.find({})
        const offer = await OFFER.aggregate([
            {
                $lookup: {
                  from: 'categories', // The name of the Category collection in MongoDB
                  localField: 'categoryName', // Field in OFFER
                  foreignField: '_id', // Field in Category
                  as: 'categoryData', // Output array field
                },
              },
              {
                $unwind: '$categoryData', // Flatten the categoryData array
              },
              {
                $project: {
                  offer: 1, // Include required OFFER fields
                  'categoryData.category': 1, 
                  description:1,
                  CreatedAt:1,
                  expiredAt:1
                },
              }
        ])
        console.log(offer)
        console.log('offer',offer)

        res.render('admin/Offer',{CURRENTpage:'offer',item:catgry,offer})
    } catch (error) {
        console.log(error)   
    }
    
 }

module.exports={
    removeOFF,
    addOffer,
    getOffer

}