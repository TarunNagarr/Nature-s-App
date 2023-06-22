const mongoose = require('mongoose');
// const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name']
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true
    // validate: [validator.isEmail, 'Please Provide Valid Email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8
  },
  confirmPassword: {
    type: String,
    required: [true, 'A user must have a confirmPassword']
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
