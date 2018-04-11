const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

exports.register = (req, res, next) => {
  let user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  user.picture = user.gravatar();
  user.isSeller = req.body.isSeller;

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if(existingUser) {
      res.json({success: false, message: 'Account with that email already exist'})
    } else {
      user.save();

      let token = jwt.sign({
        user: user
      }, process.env.SECRET, {
        expiresIn: '7d'
      })

      res.json({
        success: true,
        message: 'Enjoy your token',
        token: token
      })
    }
  })
}

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if(err) next(err)
    if(!user) {
      res.json({
        success: false,
        message: 'Authentication failed, User not found'
      })
    } else if(user) {

      let validPassword = user.comparePassword(req.body.password);
      if(!validPassword) {
        res.json({
          success: false,
          message: 'Authentication. Invalid email or password'
        })
      } else {
        let token = jwt.sign({
          user: user
        }, process.env.SECRET, {
          expiresIn: '7d'
        })

        res.json({
          success: true,
          message: 'Enjoy your token',
          token: token
        })
      }
    }
  })
}

exports.getProfile = (req, res, next) => {
  User.findOne({ _id: req.decoded.user._id }, (err, user) => {
    res.json({
      success: true,
      user: user,
      message: 'Successful'
    })
  })
}

exports.updateProfile = (req, res, next) => {
  User.findOne({ _id: req.decoded.user._id }, (err, user) => {
    if(err) return next(err)

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;

    user.isSeller = req.body.isSeller;

    user.save();
    res.json({
      success: true,
      message: 'Successfully updated profile'
    })
  })
}

exports.getProfileAddress = (req, res, next) => {
  User.findOne({ _id: req.decoded.user._id }, (err, user) => {
    res.json({
      success: true,
      address: user.address,
      message: 'Successful'
    })
  })
}

exports.addProfileAddress = (req, res, next) => {
  User.findOne({ _id: req.decoded.user._id }, (err, user) => {
    if(err) return next(err)

    if(req.body.addr1) user.address.addr1 = req.body.addr1;
    if(req.body.addr2) user.address.addr2 = req.body.addr2;
    if(req.body.city) user.address.city = req.body.city;
    if(req.body.country) user.address.country = req.body.country;
    if(req.body.postalCode) user.address.postalCode = req.body.postalCode;


    user.save();
    res.json({
      success: true,
      message: 'Successfully added address'
    })
  })
}

exports.orders = (req, res, next) => {
  Order.find({ owner: req.decoded.user._id })
    .populate('products.product')
    .populate('owner')
    .exec((err, orders) => {
      if(err) {
        res.json({
          success: false,
          message: 'Could not find your order'
        })
      } else {
        res.json({
          success: true,
          message: 'Found your orders',
          orders: orders
        })
      }
    })
}

exports.singleOrder = (req, res, next) => {
  Order.find({ owner: req.decoded.user._id })
    .deepPopulate('products.product.owner')
    .populate('owner')
    .exec((err, order) => {
      if(err) {
        res.json({
          success: false,
          message: 'Could not find your order'
        })
      } else {
        res.json({
          success: true,
          message: 'Found your order',
          order: order
        })
      }
    })
}
