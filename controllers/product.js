const Product = require('../models/Product');
const faker = require('faker');
const async = require('async');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');


exports.getProductsByOwner = (req, res, next) => {
  Product.find({ owner: req.decoded.user._id })
    .populate('owner')
    .populate('category')
    .exec((err, products) => {
      res.status(200).json({
        success: true,
        message: `Products from: ${req.decoded.user.username}`,
        products
      })
    })
}

exports.getProductsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const userId = await User.findOne({username});
    await Product.find({ owner: userId })
      .populate('owner')
      .populate('category')
      .exec((err, products) => {
        res.status(200).json({
          success: true,
          message: `Products from: ${username}`,
          products
        })
      })
  } catch(err) {
    next(err)
  }
}

// exports.deleteProductByOwner = (req, res, next) => {
//   Product.find({ owner: req.decoded.user._id })
//     .populate('owner')
//     .populate('category')
//     .exec((err, products) => {
//       res.json({
//         success: true,
//         message: `Products from: ${req.decoded.user.username}`,
//         products
//       })
//     })
// }

exports.deleteProductByOwner = async (req, res, next) => {
  try {
    const productId = req.body.id;
    // get the article

    const product = await Product.findById(productId)
    if(!product) {
      return res.status(404).send({error: 'Product with that id is not found'});
   }
    // get the owner
    const userId = req.decoded.user._id;
    const owner = await User.findById(userId);
    if(!owner) {
      return res.status(404).send({error: 'Owner of this product is not found'});
    }
    if(userId == product.owner) {
      // remove product
      await product.remove();
      //remove product from owners products list
      owner.products.pull(product);
      await owner.save();

      res.status(200).json({
         success: true,
         message: "Product is deleted"
        })
    } else {
      res.status(200).json({
        success: false,
        message: "You are not allowed to delete this product" })
    }
  } catch(err) {
    next(err)
  }
}

exports.getProductById = (req, res, next) => {
  Product.findById({ _id: req.params.id })
    .populate('category')
    .populate('owner')
    .deepPopulate('reviews.owner')
    .exec((err, product) => {
      if(err) {
        res.json({
          success: false,
          message: 'Product is not found'
        })
      } else {
        if(product) {
          res.json({
            success: true,
            product: product
          })
        }
      }
    })
}

exports.getAllProducts = (req, res, next) => {
  const perPage = 10;
  const page = req.query.page;
  async.parallel([
    function(callback) {
      Product.count({}, (err, count) => {
        let totalProducts = count;
        callback(err, totalProducts)
      })
    },
    function(callback) {
      Product.find({})
        .skip(perPage * page)
        .limit(perPage)
        .populate('category')
        .populate('owner')
        .populate('reviews')
        .exec((err, products) => {
          if(err) return next(err)
          callback(err, products)
        })
    }
  ], function(err, results) {
    let totalProducts = results[0];
    let products = results[1];
    res.json({
      success: true,
      message: 'category',
      products: products,
      totalProducts: totalProducts,
      pages: Math.ceil(totalProducts / perPage)
    })
  })
}

exports.getProductsCount = async (req, res, next) => {
  try {
    const count = await Product.count({})

    res.json({
      success: true,
      count
    })  
  } catch(err) {
    next(err)
  }
}



exports.addProduct = async (req, res, next) => {
  try {
    const author = await User.findById(req.decoded.user._id);

    let product = new Product();
    product.owner = req.decoded.user._id;
    product.category = req.body.categoryId;
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    product.image = req.file.location;
    product.save();
    author.products.push(product);
    author.save();
    res.json({
      success: true,
      message: `Successfully added the product: ${product.title}`,
      product
    })
  } catch(err) {
    next(err)
  }
}

exports.editProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.decoded.user._id);
    const updatedProduct = req.body;

    if(user.id === updatedProduct.owner) {
      const product = await Product.findByIdAndUpdate(updatedProduct.id, updatedProduct, {new: true});
      if(!product) {
        return res.status(404).send({error: 'Article is not found'});
      }
      res.status(200).json({
        success: true,
        message: `Successfully updated the product: ${product.title}`,
        product: product
      })
    }
  } catch(err) {
    next(err)
  }
  // User.findOne({ _id: req.decoded.user._id }, (err, user) => {
  //   if(err) return next(err)
  //
  //   if (req.body.name) user.name = req.body.name;
  //   if (req.body.email) user.email = req.body.email;
  //   if (req.body.password) user.password = req.body.password;
  //
  //   user.isSeller = req.body.isSeller;
  //
  //   user.save();
  //   res.json({
  //     success: true,
  //     message: 'Successfully updated profile'
  //   })
  // })
}

exports.reviewProduct = (req, res, next) => {
  async.waterfall([
    function(callback) {
      Product.findOne({ _id: req.body.productId }, (err, product) => {
        if(product) {
          callback(err, product)
        }
      })
    },
    function(product) {
      let review = new Review();
      review.owner = req.decoded.user._id;

      if(req.body.title) review.title = req.body.title;
      if(req.body.description) review.description = req.body.description;
      review.rating = req.body.rating;

      product.reviews.push(review._id);
      product.save();
      review.save();
      res.json({
        success: true,
        message: 'Successfully added the review'
      })
    }
  ])
}

exports.order = (req, res, next) => {
  const stripeToken = req.body.stripeToken;
  const currentCharges = Math.round(req.body.totalPrice * 100);

  stripe.customers
    .create({
      source: stripeToken.id
    })
    .then(function(customer) {
      return strupe.chargers.create({
        amount: currentCharges,
        currency: 'usd',
        customer: customer.id
      })
    })
    .then(function(charge) {
      const products = req.body.products;

      let order = new Order();
      order.owner = req.decoded.user._id;
      order.totalPrice = currentCharges;

      products.map(product => {
        order.products.push({
          product: product.product,
          quantity: product.quantity
        })
      })

      order.save();
      res.json({
        success: true,
        message: 'Successfully made a payment'
      })
    })
}





// FAKER

exports.fakeProducts = (req, res, next) => {
  for (i=0; i < 20; i++) {
    let product = new Product();
    product.owner = '5acbba8437c56d415c70a6de';
    product.category = '5acbd45a9bc1a31bf0ac3c4b';
    product.title = faker.commerce.productName();
    product.price = faker.commerce.price();
    product.description = faker.lorem.words();
    product.image = faker.image.cats();
    product.save();
  }

  res.json({
    message: 'Successfully added 20 products'
  })
}
