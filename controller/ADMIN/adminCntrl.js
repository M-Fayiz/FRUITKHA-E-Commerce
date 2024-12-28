const adminModel=require('../../model/ADMIN/adminModel')
const bcrypt=require('bcrypt')
const USER=require('../../model/User/userModel')

const category=require('../../model/ADMIN/category');
const ORDER=require('../../model/ADMIN/Order-schema')

const PRODUCT=require('../../model/ADMIN/product')

 const securePassword = async (password) => {
    try {
      const hashpassword = await bcrypt.hash(password, 10);
      return hashpassword;
    } catch (error) {
      console.log(error);
    }
  };


const verifyLogin=async(req,res)=>{
    
    
    try {
        const {email,password}=req.body
       
        
       const temp=await securePassword(password)
      

       const admin= await adminModel.findOne({email}) 
      
       
       if(!admin){
         return  res.json({success:false,message:"InValid Email"})
       }
      
       const verify=await bcrypt.compare(password,admin.password)

       if(!verify){

       return   res.json({success:false,message:"password not match"})
       }
           req.session.admin=true
       res.json({success:true,message:"Login succesfully"})
    } catch (error) {
        res.json({success:false,message:"failed to verify"})
        
    }

}

const toogleUserStatus=async(req,res)=>{
    try {
      
        const {userId, condition} = req.body;
      
        
        USER.findByIdAndUpdate(userId,{isActive:condition})
        .then(response=>{
            console.log(response)
            res.json({success: true, message:"succesfully Updated", response:response})
        })
      
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const addCategory = async (req, res) => {
    console.log('add category');
    
        try {
            const { title, discription } = req.body;
            
            const test = await category.findOne({
                category: { $regex: new RegExp('^' + title + '$', 'i') }  
              });

                  if(test){
                    
                      return res.json({success:false,message:'Category Exist with This Title'})
                  }
            
       
    
            if (!image || !title) {
                return res.status(400).json({ success: false, message: "Please add both an image and a title." });
            }
    
            const saveCategory = new category({
                category: title,
                image: image,
                description: discription,
            
            });
    
           const response=await saveCategory.save()

           if(response){
            res.json({success:true,response:response,message:'Category successfully Added'})

           }
        } catch (error) {
            
            console.error('Error adding category:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    };
   



const categoryStatus=async(req,res)=>{
    try {
        const {itemId,condition}=req.body
        let status;
      condition==true?status='Listed':status='Un Listed'
        
      
    category.findByIdAndUpdate(itemId,{isList:condition})
    .then(response=>{
        res.json({success:true,message:`succesfully ${status}`})
    })

    } catch (error) {
        console.log(error.message);
        
    }
    
}


const EditCategory=async(req,res)=>{
    
console.log('edit Category');

    try {
        const { modalTitle, modalDescription, productId} = req.body;

// console.log(CatOffer,productId);

    const test = await category.findOne({
  category: { $regex: new RegExp('^' + modalTitle + '$', 'i') }  
});
    if(test){
        return res.json({success:false,message:'Category Exist with This Title'})
    }

        const updates = {};
      
        // Only add fields to the `updates` object if they are provided
        if (modalTitle) {
          updates.category = modalTitle;
        }
        if (modalDescription) {
          updates.description = modalDescription;
        }
   
        if (req.file) {
          updates.image = req.file.filename; 
        }
      
       
        console.log(updates);
        
       const response=await category.findByIdAndUpdate(productId,updates,{new:true})
               

 res.json({success:true,response:response,message:'Category Updated'})
                
                


        // res.json({success:true,message:"succesfully updated"})
    } catch (error) {
        res.json({success:false,message:error})
        console.log(error.message);
        
        
    }
}



const clearOffer=async(req,res)=>{
    const {categoryID}=req.body

    
    try {
      const result=  await category.updateMany({category:categoryID},
            {
                $set:{
                   Offer:null
                }
            }
        ) 
    if(result){
      const updated=  await PRODUCT.updateMany({Category:categoryID},
            {
                $set:{
                   OfferPrice:0
                }
            }
        )
        if(!updated){
            return res.json({success:false,message:'failed to update'})
        }
         
    }
      
        res.json({success:true,message:'succefuly removed'})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
   
}



// RENDERING.............///////
// RENDERING.............///////

const LoadLogin=(req,res)=>{
    try {
        
        res.render('admin/page-account-login')
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success:false,message:'Internal Error please try later'})
    }
    
}

const LoadHome=async(req,res)=>{
    try {
        const orders=await ORDER.find({}).populate('UserID').limit(8)
        
        const dash = await ORDER.aggregate([
         
            // {
            //   $match: {
            //     orderStatus: { $nin: ["Cancelled", "Returned"] } 
            //   }
            // },
          
            {
              $group: {
                _id: null,
                revenue: { $sum: '$Final_Amount' }, 
                totalOrder: { $sum: 1 },           
                discount: { $sum: '$Coupon.discountValue' } 
              }
            }
          ])
       const data=dash[0]
    //   const  data={
    //         metrics: report[0] || {
    //             totalOrders: 0,
    //             totalOrderAmount: 0,
    //             totalDiscounts: 0,
    //         },
    //     }
    
    res.render('admin/index',{CURRENTpage:'home',orders,data})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success:false,message:'Internal Error please try later'})
    }
    
}

const LoadCategory=async(req,res)=>{
try {
    const data= await category.find({}).populate('Offer');
    res.render('admin/page-categories',{data ,CURRENTpage:'category'})
    // console.log('loadCategory',data);
    
} catch (error) {
    console.log(error.message);
    
}
    
}


const Load_User=async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const skip = (page - 1) * limit;

  const Block=req.query.Block

  
let query={}
  if(Block){

     query.isActive=Block
  }
        const user = await USER.find(query).skip(skip).limit(limit);

        const totalUser= await PRODUCT.countDocuments({});
        const totalPages = Math.ceil(totalUser/ limit);

  
        if (skip >= totalUser && totalUser > 0) {
            return res.redirect('/admin/userList?page=' + totalPages);
        }

   

    res.render('admin/user-manage',{user,CURRENTpage:'userList',
        currentPage: page,
        totalPages, 
        totalUser ,
    })
   
    
    } catch (error) {
        console.log(error.message);
        
    }
}





module.exports={
    verifyLogin,
    LoadLogin,
    LoadHome,
    Load_User,
    toogleUserStatus,
    addCategory,
    LoadCategory,
    clearOffer,
    categoryStatus,
    EditCategory,
   
}