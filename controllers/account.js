const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    let user = new User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.picture = user.gravatar();
    user.isSeller = req.body.isSeller;

    const checkUsername = await User.findOne({ username: req.body.username })
    if(checkUsername) {
      return res.status(422).json({success: false, message: 'Account with that username already exists'})
    }

    const checkEmail = await User.findOne({ email: req.body.email });
    if(checkEmail) {
      return res.status(422).json({success: false, message: 'Account with that email already exists'})
    }

    user.password = await user.encryptPassword(req.body.password)

    // if username and email does not exist in database then create new user
    user.save();

    let token = jwt.sign({
      user: user
    }, process.env.SECRET_JWT, {
      expiresIn: '7d'
    })

    res.json({
      success: true,
      message: 'Account successfully created. Feel free to log in.',
      token: token
    })
  } catch(err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({email}).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    if (user) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
          let token = jwt.sign({
            user: user
          }, process.env.SECRET_JWT, {
            expiresIn: '7d'
          })

          return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token: token,
            username: user.username,
            email: user.email,
            avatar: user.picture
          })
        }
        return res.status(401).send({error: 'Invalid email or password'});
    }
  } catch(err) {
    next(err)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const userId = req.decoded.user._id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Something went wrong, user not found'
      })
    }
    if (user) {
      const isMatch = await user.comparePassword(currentPassword);
      if(!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Wrong current password.'
        })
       }

      if (isMatch) {
        const encryptedPassword = await user.encryptPassword(newPassword)
        user.password = encryptedPassword;
        user.save();
        res.status(200).json({
          success: true,
          message: 'Password successfully changed!',
          user
        })
      }
    }

  } catch(err) {
    next(err)
  }
}

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.decoded.user._id })
      .populate('products')
    if(!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      })
    }
    if(user) {
      return res.status(201).json({
        success: true,
        message: 'Successfully found user profile',
        user: user
      })
    }
  } catch(err) {
    next(err)
  }
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

exports.editProfile = async (req, res, next) => {
  try {
    const { _id } = req.decoded.user;
    const updatedUser = req.body;
    const user = await User.findByIdAndUpdate({_id}, updatedUser, {new: true});

    if(!user) {
      return res.status(404).send({error: 'User not found'});
   }
    res.status(200).json({
      success: true,
      message: 'Successfully updated profile',
      user
    })
  } catch(err) {
    next(err)
  }
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

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch(err) {
    next(err);
  }
}

exports.getByUsername = async (req, res, next) => {
  // const { username } = req.params;
  try {
    const { username } = req.params;
    const user = await User.findOne({username});
    if(!user) {
      return res.status(404).send({error: 'User not found'});
   }
    res.status(200).send(user)
  } catch(err) {
    next(err)
  }
}

exports.editUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const updatedUser = req.body;
    const user = await User.findOneAndUpdate({username}, updatedUser, {new: true});

    if(!user) {
      return res.status(404).send({error: 'User not found'});
   }
    res.status(200).send(user)
  } catch(err) {
    next(err)
  }
}

exports.getUserArticles = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({username}).populate('articles');
    res.status(200).send(user.articles)
  } catch(err) {
    next(err)
  }
}

exports.newUserArticle = async (req, res, next) => {
  try {
    const { username } = req.params;
    // create a new article
    const newArticle = new Article(req.body);
    // get user/author
    const user = await User.findOne({username});

    // assign user as a article user
    newArticle.user = user;
    // save the article
    await newArticle.save();
    // save the article to the users articles array
    user.articles.push(newArticle);
    // save the user
    await user.save();
    res.status(201).send(newArticle)
  } catch(err) {
    next(err)
  }
}

exports.getUsersCount = async (req, res, next) => {
  try {
    const count = await User.count({})

    res.json({
      success: true,
      count
    })
  } catch(err) {
    next(err)
  }
}
