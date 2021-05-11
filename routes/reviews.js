const express = require('express');
const router = express.Router({mergeParams: true});

// const app = express();
// const path = require('path');
// const mongoose = require('mongoose');
// const ejsMate = require('ejs-mate');
const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/ExpressError.js');
// const methodOverride = require('method-override');
const Campground = require('../models/campground');
// const { campgroundSchema, reviewSchema} = require('../schemas.js');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, isReviewAuthor, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    console.log(req.user._id);
    review.author = req.user._id;
    console.log(review.author);
    // console.log(review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', "Created new review")
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, validateReview, catchAsync(async (req, res) => {
    const { id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
}));


module.exports = router;