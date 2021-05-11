const express = require('express');
const router = express.Router({mergeParams: true});

// const app = express();
// const path = require('path');
// const mongoose = require('mongoose');
// const ejsMate = require('ejs-mate');
const catchAsync = require('../utils/catchAsync.js');
// const ExpressError = require('../utils/ExpressError.js');
// const methodOverride = require('method-override');
const Campground = require('../models/campground');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// const { campgroundSchema, reviewSchema} = require('../schemas.js');
// const Review = require('../models/review.js');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds})
}));

router.get('/new', isLoggedIn, catchAsync(async (req, res) => { 
    // if(!req.isAuthenticated()){
    //     req.flash('error', 'you must be signed in');
    //     return res.redirect('/login');
    // }
    res.render("campgrounds/new");
}));

router.post('/', isLoggedIn, validateCampground, catchAsync( async (req, res) => { 
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    // const campgroundSchema = joi.object({
    //     campground: joi.object({
    //         title: joi.string().required(),
    //         price: joi.number().required().min(0),
    //         image: joi.string().required,
    //         location: joi.string().required,
    //         descriptiom: joi.string().required()
    //     }).required()
    // })
    // const {error} = campgroundSchema.validate(req.body);
    // if(error){
    //     const msg = error.details.map(el => el.message).join(', ');
    //     next(new ExpressError(msg, 400));
    // }
    // console.log(req.body);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!!!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    
    const { id } = req.params;
    // const campground= await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You do not have permissionto do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');  
    if(!campground){
        req.flash('error', "Cannot find that campground");
        req.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground= await Campground.findById(id);
    if(!campground){
        req.flash('error', "Cannot find that campground");
        req.redirect('/campgrounds');
    }
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You do not have permissionto do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    res.render('campgrounds/edit', { campground})
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    // const campground= await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You do not have permissionto do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted campground");
    res.redirect('/campgrounds');
}));


module.exports = router;