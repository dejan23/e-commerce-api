const Category = require('../controllers/category');

module.exports = function(app) {
  app.get('/api/categories', Category.getAllCategories)
  app.get('/api/categories/:id', Category.getProductsByCategory)
  app.post('/api/categories', Category.addCategory)
}
