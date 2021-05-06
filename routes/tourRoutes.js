const express = require('express');
const router = express.Router();
const tourCtrl = require('../controllers/tourController');
const authCtrl = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(tourCtrl.aliasTopTours, tourCtrl.getAllTours);
router.route('/tour-stats').get(tourCtrl.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide', 'guide'),
    tourCtrl.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourCtrl.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourCtrl.getDistances);

router
  .route('/')
  .get(tourCtrl.getAllTours)
  .post(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourCtrl.createTour
  );

router
  .route('/:id')
  .get(tourCtrl.getTour)
  .patch(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourCtrl.uploadTourImages,
    tourCtrl.resizeTourImages,
    tourCtrl.updateTour
  )
  .delete(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourCtrl.deleteTour
  );

module.exports = router;
