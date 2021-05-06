const express = require('express');
const bookingCtrl = require('../controllers/bookingController');
const authCtrl = require('../controllers/authController');

const router = express();

router.get(
  '/checkout-session/:tourId',
  authCtrl.protect,
  bookingCtrl.getCheckoutSession
);

module.exports = router;
