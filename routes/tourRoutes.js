const express = require('express');

const router = express.Router();
const tourController = require('../controllers/toursControllers');

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updatedTour)
  .delete(tourController.deleteTour);

module.exports = router;
