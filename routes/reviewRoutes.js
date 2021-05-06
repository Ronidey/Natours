const express = require('express');
const router = express.Router({ mergeParams: true });
const authCtrl = require('../controllers/authController');
const reviewCtrl = require('../controllers/reviewController');

router.use(authCtrl.protect);

router
  .route('/')
  .get(reviewCtrl.getAllReviews)
  .post(
    authCtrl.restrictTo('user'),
    reviewCtrl.setTourUserIds,
    reviewCtrl.createReview
  );

router
  .route('/:id')
  .get(reviewCtrl.getReview)
  .patch(authCtrl.restrictTo('user', 'admin'), reviewCtrl.updateReview)
  .delete(authCtrl.restrictTo('user', 'admin'), reviewCtrl.deleteReview);

module.exports = router;
