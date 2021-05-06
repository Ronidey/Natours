const express = require('express');
const viewsCtrl = require('../controllers/viewsController');
const authCtrl = require('../controllers/authController');
const bookingCtrl = require('../controllers/bookingController');
const router = express.Router();

router.get(
  '/',
  authCtrl.isLoggedIn,
  bookingCtrl.createBookingCheckout,
  viewsCtrl.getOverview
);
router.get('/tour/:slug', authCtrl.isLoggedIn, viewsCtrl.getTour);
router.get('/login', authCtrl.isLoggedIn, viewsCtrl.getLoginForm);
router.get('/me', authCtrl.protect, viewsCtrl.getAccount);
router.get('/my-tours', authCtrl.protect, viewsCtrl.getMyTours);

module.exports = router;
