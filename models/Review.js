const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  }
}, {timestamps: true})

module.exports = mongoose.model('Review', ReviewSchema)
