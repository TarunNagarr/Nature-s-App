const crypto = require('crypto');
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

// Create Common Token

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
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

  createSendToken(newUser, 201, res);
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

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get User based on the Token!
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If Token has not expired , and there is user, set the new Password

  if (!user) {
    return next(new AppError('Token is invalid or Expired', 404));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Log the user in, send JWT token

  createSendToken(user, 200, res);
});

// User Update Password

exports.updatePassword = catchAsync(async (req, res, next) => {
  // a.) Get User from Collection
  const user = await User.findById(req.user.id).select('+password');

  // b.) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current Password is wrong', 401));
  }

  // c.) It so, update Password
  user.password = req.body.password;
  user.confirmPassword = req.body.passwordConfirm;
  await user.save();

  // d.) Log user in , send JWT
  createSendToken(user, 200, res);
});
