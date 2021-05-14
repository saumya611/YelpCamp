const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campground');
// const { campgroundSchema, reviewSchema} = require('../schemas.js');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync( reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( reviews.deleteReview));

module.exports = router;