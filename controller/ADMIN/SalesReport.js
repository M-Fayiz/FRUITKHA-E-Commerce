const ORDER=require('../../model/ADMIN/Order-schema')
const product = require('../../model/ADMIN/product')

const salesReport=async(req,res)=>{
  console.log('get in sales report')
   try {
    const { startDate,endDate, quickFilter  } = req.query;

    console.log(req.query)
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
    }else if(quickFilter === 'custom'){
      quickFilter=''
    } else if (startDate && endDate) {
      filters = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }
    
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


    res.render('admin/salesReport',{CURRENTpage:'sales',orders,
      metrics: report[0] || {
          totalOrders: 0,
          totalOrderAmount: 0,
          totalDiscounts: 0,
      },
      })
   } catch (error) {
    console.log(error.message)
   }
}



const genorate=async (req, res) => {
    
  //   const { startDate,endDate, quickFilter  } = req.body;
  // console.log(req.body)
  //   try {

  //   //  console.log(filters,'filters')
            
           
            
       

   
  //       res.json({
  //           success: true,
               

  //           },
  //       });
  //   } catch (error) {
  //       console.error('Error fetching sales report:', error);
  //       res.status(500).json({ success: false, message: 'Internal server error' });
  //   }
}




module.exports={
    salesReport,
    genorate
}