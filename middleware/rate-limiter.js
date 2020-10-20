const rateLimit = require('express-rate-limit')

module.exports = rateLimit({
  max: 5, // max attempts
  duration: 1 * 60 * 1000 // 1 minute
})
