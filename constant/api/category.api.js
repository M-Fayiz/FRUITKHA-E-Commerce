const CATEGORY_API = {
  COLLECTION: '/api/categories',
  ITEM: (categoryId = ':categoryId') => `/api/categories/${categoryId}`,
  STATUS: (categoryId = ':categoryId') => `/api/categories/${categoryId}/status`,
  CLEAR_OFFER: '/api/categories/offers/clear',
}

module.exports = { CATEGORY_API }
