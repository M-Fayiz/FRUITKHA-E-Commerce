const ADDRESS_API = {
  COLLECTION: '/api/addresses',
  ITEM: (addressId = ':addressId') => `/api/addresses/${addressId}`,
}

module.exports = { ADDRESS_API }
