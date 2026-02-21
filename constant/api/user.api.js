const USER_API = {
  PROFILE: '/api/users/profile',
  PROFILE_PASSWORD: '/api/users/profile/password',
  STATUS: (userId = ':userId') => `/api/users/${userId}/status`,
}

module.exports = { USER_API }
