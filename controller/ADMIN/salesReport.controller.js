const ORDER=require('../../model/ADMIN/order-schema')
const product = require('../../model/ADMIN/product')
const httpStatusCode = require('../../constant/httpStatusCode')
const httpResponse = require('../../constant/httpResponse')
const { buildCreatedAtFilter } = require('../../utils/dateFilter.util')

const salesReport = async (req, res) => {
  console.log('get in sales report');
  try {
    
    const { startDate, endDate, quickFilter } = req.query;
    if(startDate>endDate){
      return res.status(httpStatusCode.BAD_REQUEST).send(httpResponse.INVALID_DATE_RANGE);
    }
    
    
    const filters = buildCreatedAtFilter({ quickFilter, startDate, endDate })
    
    console.log('Filters:', filters);

    
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

    const page = parseInt(req.query.page) || 1; 
    const limit = 10;
    const skip = (page - 1) * limit;

   
    const totalOrders = await ORDER.countDocuments(filters);
    const totalPages = Math.ceil(totalOrders / limit);

   
    if (skip >= totalOrders && totalOrders > 0) {
      return res.redirect('/admin/productList?page=' + totalPages);
    }

    
    const orders = await ORDER.find(filters, {
      createdAt: 1,
      Final_Amount: 1,
      'Coupon.discountValue': 1,
      payment: 1,
      paymentStatus: 1,
      orderStatus: 1,
      Products: 1,
    })
    .populate('UserID')
    .skip(skip)
    .limit(limit);

    
    res.render('admin/salesReport', {
      CURRENTpage: 'sales',
      orders,
      totalPages,
      totalProducts: totalOrders,
      currentPage: page,
      metrics: report[0] || {
        totalOrders: 0,
        totalOrderAmount: 0,
        totalDiscounts: 0,
      },
    });
  } catch (error) {
    console.error('Error in salesReport:', error.message);
    res.status(httpStatusCode.SERVER_ERROR).send(httpResponse.SERVER_ERROR);
  }
};




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
