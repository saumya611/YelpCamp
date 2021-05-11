const express = require('express');
const router = express.Router({mergeParams: true});
// const flash = require('connect-flash');
const User = require('../models/user');
const ejsMate = require('ejs-mate');
const { route } = require('./campgrounds');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('./users/register')
});

router.post('/register', catchAsync(async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new User({ email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err){
                return next(err);
                
            }
            req.flash('successss', 'Welcome to Yelp camp!!!');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', async (req, res) => {
    res.render('./users/login')
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }) , async (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl );
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!!!")
    res.redirect('/campgrounds');
});



module.exports = router;