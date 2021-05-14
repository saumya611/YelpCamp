const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review.js')
const catchAsync = require('./utils/catchAsync.js');
const { campgroundSchema, reviewSchema} = require('./schemas.js');

module.exports.isLoggedIn = (req, res, next) => {
    console.log("In The Middleware");
    if(!req.isAuthenticated()){
        console.log("REQ.USER....", req.user);
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in first');
        return res.redirect('/login');
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    console.log("In The Middleware");
    console.log(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        next(new ExpressError(msg, 400));
    } else{
        next();
    }
};

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground= await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    console.log("In The Middleware");
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    console.log("In The Middleware");
    const { error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        next(new ExpressError(msg, 400));
    } else{
        next();
    }
};