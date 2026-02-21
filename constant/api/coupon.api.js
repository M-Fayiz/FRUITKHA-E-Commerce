const COUPON_API = {
  COLLECTION: '/api/coupons',
  ITEM: (couponId = ':couponId') => `/api/coupons/${couponId}`,
}

module.exports = { COUPON_API }
