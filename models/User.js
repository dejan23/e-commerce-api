const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto')

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const UserSchema = new Schema({
  username: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  picture: {
    type: String
  },
  isSeller: {
    type: Boolean,
    default: false
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  address: {
    addr1: {
      type: String,
      default: ''
    },
    addr2: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    postalCode: {
      type: String,
      default: ''
    }
  },
}, {timestamps: true})

UserSchema.plugin(deepPopulate);

// UserSchema.pre('save', function(next) {
//   const user = this;
//   bcrypt.genSalt(10, function(err, salt) {
//     if(err) return next(err);
//     bcrypt.hash(user.password, salt, function(err, hash) {
//       user.password = hash;
//       console.log('pre save', hash)
//       next();
//     })
//   })
// })

UserSchema.methods.eencryptPassword = function(password, callback) {
   bcrypt.genSalt(10, function(err, salt) {
    if(err) return next(err);
     bcrypt.hash(password, salt, function(err, hash) {
      encryptedPassword = hash;
       callback(null, encryptedPassword);
    })
  })
}

UserSchema.methods.encryptPassword = function(textPassword) {
  return bcrypt.hash(textPassword, 10).then(function(hash) {
    return hash;
});
}

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

UserSchema.methods.gravatar = function(size) {
  if(!this.size) size = 200;
  if(!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';

  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro';
}

module.exports = mongoose.model('User', UserSchema)
