const Product = require('../controllers/product');
const checkJWT = require('../middlewares/check-jwt')
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey:  process.env.AWS_S3_SECRET_KEY
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'ecom3',
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports = function(app) {
  app.get('/api/products', Product.getAllProducts)
  app.post('/api/product/review', checkJWT, Product.reviewProduct)
  app.post('/api/product/order', checkJWT, Product.order)
  // app.get('/api/products', checkJWT, Product.getProductsByOwner)
  app.get('/api/product/:id', Product.getProductById)
  app.post('/api/products', checkJWT, upload.single('product_picture'), Product.addProduct)
  app.post('/api/fakeproducts', Product.fakeProducts)
}
