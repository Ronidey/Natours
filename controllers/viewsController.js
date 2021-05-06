const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get Tour data from the collection
  const tours = await Tour.find();

  res.render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('No Tour found with that name!', 404));
  }

  res.render('tour', {
    title: `${tour.name} tour`,
    tour
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find All Bookings
  const bookings = await Booking.find({ user: req.user._id });

  // 2) Get booked tour ids
  const tourIds = bookings.map((b) => b.tour);

  // 3) Get tours data
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getLoginForm = (req, res) => {
  res.render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.render('account', {
    title: 'My Account'
  });
};
