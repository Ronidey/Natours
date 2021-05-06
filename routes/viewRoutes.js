const express = require('express');
const viewsCtrl = require('../controllers/viewsController');
const authCtrl = require('../controllers/authController');
const router = express.Router();

router.use(viewsCtrl.alerts);

router.get('/', authCtrl.isLoggedIn, viewsCtrl.getOverview);
router.get('/tour/:slug', authCtrl.isLoggedIn, viewsCtrl.getTour);
router.get('/login', authCtrl.isLoggedIn, viewsCtrl.getLoginForm);
router.get('/signup', authCtrl.isLoggedIn, viewsCtrl.getSignupForm);
router.get('/me', authCtrl.protect, viewsCtrl.getAccount);
router.get('/my-tours', authCtrl.protect, viewsCtrl.getMyTours);

module.exports = router;
