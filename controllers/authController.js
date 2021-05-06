const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
// const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV !== 'development' ? true : false,
    httpOnly: true
  });

  // preventing password from getting sent to the user
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// ==== Authentication =====
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, photo, password, confirmPassword } = req.body;

  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    confirmPassword
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // check is user exists and password is valid
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! please log in', 401));
  }

  //Token verification
  /* jwt.verify() only runs asynchronously if the callback function is provided
  otherwise it would run synchronously, i wanna use async await that's why
  first it need to make it return promise and for that i'm gonna use promisify */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist!', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError('User recently changed password! please login again', 401)
    );
  }

  // everything is fine!
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// ======== Is Logged In ===========
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if user exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // everything is fine!
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// ==== Authorization =====
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// ======= Password Reset ==========
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user with the given email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user exists with the given email!', 404));
  }

  // 2. Generate the random token
  const resetToken = await user.createPasswordResetToken();

  try {
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired & user exists, set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired!', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in (send JWT)
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Getting user from the collection so i could select the password prop
  const user = await User.findById(req.user._id).select('+password');

  // 2) Check if current password matched with the user password
  if (!(await user.verifyPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong!', 401));
  }

  // 3) update user's password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4) Send JWT
  createSendToken(user, 200, res);
});
