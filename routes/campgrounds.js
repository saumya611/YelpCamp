const express = require('express');
const router = express.Router({mergeParams: true});

// const app = express();
// const path = require('path');
const catchAsync = require('../utils/catchAsync.js');
const Campground = require('../models/campground');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// const { campgroundSchema, reviewSchema} = require('../schemas.js');
// const Review = require('../models/review.js');

const campgrounds = require('../controllers/campgrounds');

router.route('/')
    .get(catchAsync(campgrounds.indexPage))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground ))
    .delete(isLoggedIn, isAuthor, catchAsync( campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;