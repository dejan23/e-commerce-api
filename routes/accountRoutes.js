const Account = require('../controllers/account');
const checkJWT = require('../middlewares/check-jwt')

module.exports = function(app) {
  app.post('/api/accounts/register', Account.register)
  app.post('/api/accounts/login', Account.login)
  app.post('/api/accounts/reset-password', checkJWT, Account.resetPassword)

  app.get('/api/accounts/profile', checkJWT, Account.getProfile)
  app.patch('/api/accounts/profile', checkJWT, Account.editProfile)

  app.get('/api/accounts/profileAddress', checkJWT, Account.getProfileAddress)
  app.post('/api/accounts/profileAddress', checkJWT, Account.addProfileAddress)
  app.get('/api/accounts/orders', checkJWT, Account.orders)
  app.get('/api/accounts/orders/:id', checkJWT, Account.singleOrder)

  app.get('/api/accounts/:username', Account.getByUsername)

  app.get('/api/accounts/', Account.getUsersCount)

}
