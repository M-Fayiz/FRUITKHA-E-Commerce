const ORDER=require('../../model/ADMIN/Order-schema')
const product = require('../../model/ADMIN/product')

const salesReport=(req,res)=>{
   try {
    res.render('admin/salesReport',{CURRENTpage:'sales'})
   } catch (error) {
    console.log(error.message)
   }
}



const genorate=async (req, res) => {
    
    const { startDate,endDate, quickFilter  } = req.body;
  console.log(req.body)
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
        
    //  console.log(filters,'filters')
            const report = await ORDER.aggregate([
                { $match: filters },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalOrderAmount: { $sum: '$Final_Amount' },
                        totalDiscounts: { $sum: '$Coupon.discountValue' },
                    },
                },
            ]);
           
            
        const orders = await ORDER.find(filters, {
            createdAt: 1,
            Final_Amount: 1,
            'Coupon.discountValue': 1,
            payment:1,
            paymentStatus:1,
            orderStatus:1,
            Products:1
        }).populate('UserID')

   
        res.json({
            success: true,
                data: {
                    metrics: report[0] || {
                        totalOrders: 0,
                        totalOrderAmount: 0,
                        totalDiscounts: 0,
                    },
                    orders,

            },
        });
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}




module.exports={
    salesReport,
    genorate
}