const ORDER=require('../../model/admin/order-schema')
const categorry=require('../../model/admin/category')
const httpStatusCode = require('../../constant/httpStatusCode')
const httpResponse = require('../../constant/httpResponse')
const { buildCreatedAtFilter } = require('../../utils/dateFilter.util')

const graph=async(req,res)=>{
 
     const {startDate,endDate,quickFilter}=req.body
     try {

        const filters = buildCreatedAtFilter({ quickFilter, startDate, endDate })
        

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


            return res.status(httpStatusCode.OK).json({success:true,report,category,monthlySales,hello})
        
    
       
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(httpStatusCode.SERVER_ERROR).json({ success: false, message: httpResponse.SALES_REPORT_ERROR });
    }
}


module.exports={
    graph
}
