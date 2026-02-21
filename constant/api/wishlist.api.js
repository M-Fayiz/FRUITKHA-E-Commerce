const WISHLIST_API = {
  TOGGLE: '/api/wishlist/items/toggle',
  ITEM: (itemId = ':itemId') => `/api/wishlist/items/${itemId}`,
}

module.exports = { WISHLIST_API }
