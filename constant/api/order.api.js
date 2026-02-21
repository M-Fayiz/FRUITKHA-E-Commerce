const ORDER_API = {
  COLLECTION: '/api/orders',
  STATUS: (orderId = ':orderId') => `/api/orders/${orderId}/status`,
  CANCEL: (orderId = ':orderId') => `/api/orders/${orderId}/cancel`,
  CANCEL_ITEM: (orderId = ':orderId', productId = ':productId') =>
    `/api/orders/${orderId}/items/${productId}/cancel`,
  RETURN_ORDER: (orderId = ':orderId') => `/api/orders/${orderId}/returns`,
  RETURN_ITEM: (orderId = ':orderId', productId = ':productId') =>
    `/api/orders/${orderId}/items/${productId}/returns`,
  RETURN_RESPONSE: '/api/orders/returns/response',
  RETURN_PRODUCT_RESPONSE: '/api/orders/returns/items/response',
}

module.exports = { ORDER_API }
