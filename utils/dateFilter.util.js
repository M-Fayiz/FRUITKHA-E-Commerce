const { QUICK_FILTER } = require('../constant/status/quickFilterStatus')

const buildCreatedAtFilter = ({ quickFilter, startDate, endDate }) => {
  let filters = {}
  const now = new Date()

  if (quickFilter === QUICK_FILTER.ONE_DAY) {
    filters = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
  } else if (quickFilter === QUICK_FILTER.ONE_WEEK) {
    filters = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
  } else if (quickFilter === QUICK_FILTER.ONE_MONTH) {
    filters = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
  } else if (quickFilter === QUICK_FILTER.ALL) {
    filters = {}
  } else if (quickFilter === QUICK_FILTER.CUSTOM || (startDate && endDate)) {
    filters = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }
  }

  return filters
}

module.exports = {
  buildCreatedAtFilter,
}
