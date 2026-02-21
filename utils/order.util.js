const { ORDER_STATUS } = require('../constant/status/orderStatus')

const calculateRefundAndAdjustments = (order, product) => {
  const initialSubTotal = order.subTotal
  const initialDiscount = order.Coupon.discountValue
  const intialGst = order.GST

  const allProductsReturned = order.Products.every(
    (lineItem) => lineItem.status === ORDER_STATUS.RETURNED
  )
  const shipping = allProductsReturned ? 0 : order.Shipping

  const productGSTshare = Math.round((intialGst / initialSubTotal) * product.TOTAL)
  const productDiscountShare = Math.round((initialDiscount / initialSubTotal) * product.TOTAL)
  const refundAmount = product.TOTAL + productGSTshare - productDiscountShare

  const remainingGst = Math.round(intialGst - productGSTshare)
  const remainingSubTotal = Math.max(0, initialSubTotal - product.TOTAL)
  const remainingDiscount = Math.round(initialDiscount - productDiscountShare)
  const finalAmount = Math.max(0, remainingSubTotal + remainingGst + shipping - remainingDiscount)

  return {
    refundAmount: Math.round(refundAmount),
    orderStatus: allProductsReturned ? ORDER_STATUS.RETURNED : order.orderStatus,
    remainingSubTotal,
    remainingDiscount,
    finalAmount,
    shipping,
    remainingGst,
  }
}

module.exports = {
  calculateRefundAndAdjustments,
}
