const Tour = require('./../models/toursModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get All Tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE RESPONSE
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours }
  });
});

// Get One Tour
exports.getOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError(`No Tour Found With that Id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour }
  });
});

// Create One Tour
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newTour
  });
});

// Updated Tour
exports.updatedTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError(`No Tour Found With that Id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

// Delete Tour
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`No Tour Found With that Id`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Aggregation Pipeline

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    { $match: { _id: { $ne: 'medium' } } }
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});
