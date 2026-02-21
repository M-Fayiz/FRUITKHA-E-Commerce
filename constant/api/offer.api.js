const OFFER_API = {
  COLLECTION: '/api/offers',
  ITEM: (offerId = ':offerId') => `/api/offers/${offerId}`,
}

module.exports = { OFFER_API }
