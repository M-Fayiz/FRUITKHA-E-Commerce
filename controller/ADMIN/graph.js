const ORDER=require('../../model/ADMIN/Order-schema')
const categorry=require('../../model/ADMIN/category')
const graph=async(req,res)=>{
    // console.log(req.body)
     const {startDate,endDate,quickFilter}=req.body
     try {

        let filters = {};

        if (quickFilter === '1Day') {
          const today = new Date();
          const oneDayAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000)); 
          filters = {
            createdAt: { $gte: oneDayAgo },
          };
        } else if (quickFilter === '1Week') {
          const today = new Date();
          const oneWeekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)); 
          filters = {
            createdAt: { $gte: oneWeekAgo },
          };
        } else if (quickFilter === '1Month') {
          const today = new Date();
          const oneMonthAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); 
          filters = {
            createdAt: { $gte: oneMonthAgo },
          };
        } else if (quickFilter === 'all') {
          filters = {}; 
        } else if (startDate && endDate) {
          filters = {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          };
        }
        
  //  console.log(filters.createdAt,';;;;')
            const report = await ORDER.aggregate([
                { $match: filters },
                {$unwind:'$Products'},
                {
                    $lookup: {
                        from:'products',
                        localField:'Products.product',
                        foreignField:'_id',
                        as:'productDetails'
                    },
                },
                {$unwind:'$productDetails'},
                {
                    $group:{_id:"$productDetails.productTitle",totalsales:{$sum:"$Products.quantity"}}
                },
                {$sort:{totalsales:-1}},
                {$limit:8}
            ])
// console.log(report)
            const category=await ORDER.aggregate([
              {$match:filters},
              {$unwind:'$Products'},
              {$lookup:{
                from:'products',
                localField:'Products.product',
                foreignField:'_id',
                as:'prdctCategory'
              }},
              {$unwind:'$prdctCategory'},
              {$group:{_id:'$prdctCategory.Category',TTLsales:{$sum:'$Products.quantity'}}},
              { $sort: { TTLsales: -1 } },
              {$limit:4},

            ])

            const monthlySales = await ORDER.aggregate([
              // {
              //   $match: {
              //     orderStatus: { $nin: ["Cancelled", "Returned"] } 
              //   }
              // },
            
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                  totalSales: { $sum: "$Final_Amount" }, 
                  totalOrders: { $count: {} }, 
                },
              },
              { $sort: { _id: 1 } }
            ])
         

   const hello=[]
   for(let i of category){
   const k= await categorry.findById(i._id)
   hello.push(k.category)
   }

 console.log(hello)
            return res.status(200).json({success:true,report,category,monthlySales,hello})
        
    
       
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


module.exports={
    graph
}