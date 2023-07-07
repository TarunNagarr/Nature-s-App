const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/Email');

// Sign Token Function
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// SignUp User
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

// Login User
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // a.) Check if emaiil or Password Provided or not!
  if (!email || !password) {
    return next(new AppError('Please Provided Email & Password', 404));
  }

  // b.) Check if the email & password are matched

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // c.) Send the token if email & password are correct

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

// Protect Routes
exports.protect = catchAsync(async (req, res, next) => {
  // a.) Getting token or check if its there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! please logged in to get access', 401)
    );
  }

  // b.) Verify Token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // c.) Check if user still exist

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exist!',
        401
      )
    );
  }

  // d.) Check if user change password after the token was

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User is recently Changed Password ! Please Logged in Again!',
        401
      )
    );
  }

  // Grant Access to protected Routes
  req.user = currentUser;

  next();
});

// RestectedTo User
exports.restectedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }
    next();
  };
};

// User Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // a.) Get user Based on Posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email Id', 404));
  }

  // b.) Genrate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // c.) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

// User Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {});
