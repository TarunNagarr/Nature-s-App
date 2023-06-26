const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name']
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide Valid Email']
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
    required: [true, 'A user must have a confirmPassword'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not same!'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
