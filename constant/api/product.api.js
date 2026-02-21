const PRODUCT_API = {
  COLLECTION: '/api/products',
  ITEM: (productId = ':productId') => `/api/products/${productId}`,
  STATUS: (productId = ':productId') => `/api/products/${productId}/status`,
  STOCK: (productId = ':productId') => `/api/products/${productId}/stock`,
}

module.exports = { PRODUCT_API }
