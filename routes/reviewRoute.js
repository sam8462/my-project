const express = require('express');
const router = express.Router({mergeParams: true});//merge params is used for taking url data from parent route which is in app.js file
const asyncWrap = require('../utils/asyncWrap.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const ReviewController = require('../controller/review.js');
//review route

router.post("/", isLoggedIn, validateReview, asyncWrap(ReviewController.createNewReview));

// delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, asyncWrap(ReviewController.deleteReview));

module.exports = router;
