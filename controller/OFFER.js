const PRODUCT=require('../model/product')
const category=require('../model/category')
const OFFER=require('../model/Offer')


const removeOFF = async (req, res) => {
    try {
        const OfferID = req.body.OfferID;
        
        if (!OfferID) {
            return res.status(400).json({ success: false, message: 'OfferID is required' });
        }
        
        console.log(OfferID);
        
        const result = await OFFER.findByIdAndDelete(OfferID, { offer: null });
        console.log('offer result from clear', result);
        
        if (result) {
            try {
                const cat=await category.findByIdAndUpdate(result.categoryName,{Offer:null})
                if(cat){
                    const data=await PRODUCT.updateMany({Category:cat.category},
                        {OfferPrice:null}
                    )
                    if(data){
                        res.status(200).json({success:true,message:"Category offer succesfully Removed"})
                    }
                }
                
            } catch (error) {
                
            }
            
        } else {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const addOffer = async (req, res) => {
console.log('enter add offer');
    try {

      const { categoryID, offerPercentage,offerDescription,expiredAt,createdAt,product} = req.body;
     
      if (!categoryID || categoryID.trim() === "") {
        return res.status(400).json({ success: false, message: "Category ID is required" });
      }
     console.log(req.body)
  
     const CATEGORY =await category.findById(categoryID)

     console.log('found category',CATEGORY);
     

   const doubl=  await OFFER.findOne({categoryName:categoryID})
   console.log('duplicat',doubl)

 
   if(doubl){
    return res.status(404).json({success:false,message:'category offer already exist'})
   }
     console.log('no douplicate')

      const saveOffer=new OFFER({
        offer:offerPercentage,
        productName:product,
        categoryName:CATEGORY.id,
        description:offerDescription,
        CreatedAt:createdAt,
        expiredAt:expiredAt
      }
      );
     let saved=  await  saveOffer.save()
      
     console.log(saved,'saved')
   
  
      if (saved && saved.categoryName) {
       
        const result = await PRODUCT.updateMany(
          { Category: CATEGORY.category },
          [
            {
              $set: {
                OfferPrice: {
                  $round: [
                    {
                      $multiply: ['$RegulerPrice', 1 - saved.offer / 100] // Use 'offer' from req.body
                    },
                    2 // Round to 2 decimal places
                  ]
                }
              }
            }
          ]
        );
        console.log(saved.offer,"daced offer")
      
        
       
        if(result){

            const updatect=await category.findByIdAndUpdate(CATEGORY.id,{Offer:saved._id})
            console.log(updatect,"updated cate")

        }
        console.log('Update Result:', result);
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