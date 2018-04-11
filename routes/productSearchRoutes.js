const ProductSearch = require('../controllers/productSearch');


module.exports = function(app) {
  app.get('/api/search', ProductSearch.search)

}
