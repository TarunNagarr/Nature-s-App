const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users }
  });
});

// Get One User
exports.getOneUser = (req, res) => {
  res.status(500).json({
    status: 'Server Not Respond!'
  });
};

// Create user
exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'Server Not Respond!'
  });
};

// Updated Tour
exports.updatedUser = (req, res) => {
  res.status(500).json({
    status: 'Server Not Respond!'
  });
};

// Delete Tour
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`No User Found With that Id`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
