const ORDER_STATUS = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
}

const RETURN_ACTION = {
  APPROVE: 'Approve',
  CANCEL: 'Cancel',
}

const RETURN_ADMIN_RESPONSE = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

module.exports = {
  ORDER_STATUS,
  RETURN_ACTION,
  RETURN_ADMIN_RESPONSE,
}
