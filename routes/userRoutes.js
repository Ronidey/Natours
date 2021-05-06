const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.get('/logout', authCtrl.logout);
router.post('/forgotPassword', authCtrl.forgotPassword);
router.patch('/resetPassword/:token', authCtrl.resetPassword);

// Protect all routes after this middleware
router.use(authCtrl.protect);

router.patch('/updateMyPassword', authCtrl.updatePassword);

router.get('/me', userCtrl.getMe, userCtrl.getUser);
router.patch(
  '/updateMe',
  userCtrl.uploadUserPhoto,
  userCtrl.resizeUserPhoto,
  userCtrl.updateMe
);
router.delete('/deleteMe', userCtrl.deleteMe);

router.use(authCtrl.restrictTo('admin'));
router.route('/').get(userCtrl.getAllUsers).post(userCtrl.createUser);

router
  .route('/:id')
  .get(userCtrl.getUser)
  .patch(userCtrl.updateUser)
  .delete(userCtrl.deleteUser);

module.exports = router;
