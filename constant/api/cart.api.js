const CART_API = {
  ITEMS: '/api/cart/items',
  ITEM: (productId = ':productId') => `/api/cart/items/${productId}`,
  COUPON: '/api/cart/coupon',
}

module.exports = { CART_API }
