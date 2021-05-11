if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');

const User = require('./models/user');
const Campground = require('./models/campground');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');

const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const methodOverride = require('method-override');
const passport = require('passport');
const localStrategy = require('passport-local');

const MongoStore = require("connect-mongo");

// const joi = require('joi');

const { campgroundSchema, reviewSchema} = require('./schemas.js');
const Review = require('./models/review.js');
const { ppid } = require('process');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const { func } = require('joi');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const secret = process.env.SECRET || "it's my secret i'll not gonna tell you";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret
    },
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // By Above options third party can't access cookies 
        expires: Date.now() + 1000 * 60 *60 *24 *7,
        maxAge: 1000 * 60 *60 *24 *7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next(); 
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', catchAsync(async (req, res) => { 
    res.render("home");
}));

app.get('/makeCampGround', catchAsync(async (req, res) => {
    const camp = new campground({title: 'My Backyard', descriptiom: 'cheap camp'})
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode =500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error.ejs', { err});
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`APP IS Listening on port ${port}!`);
});