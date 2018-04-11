const Account = require('../controllers/account');
const checkJWT = require('../middlewares/check-jwt')

module.exports = function(app) {
  app.post('/api/accounts/register', Account.register)
  app.post('/api/accounts/login', Account.login)

  app.get('/api/accounts/profile', checkJWT, Account.getProfile)
  app.patch('/api/accounts/profile', checkJWT, Account.updateProfile)

  app.get('/api/accounts/profileAddress', checkJWT, Account.getProfileAddress)
  app.post('/api/accounts/profileAddress', checkJWT, Account.addProfileAddress)
  app.get('/api/accounts/orders', checkJWT, Account.orders)
  app.get('/api/accounts/orders/:id', checkJWT, Account.singleOrder)

}
