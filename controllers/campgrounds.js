const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});
// const stylesService = mbxStyles({ accessToken: MY_ACCESS_TOKEN });
// stylesService exposes listStyles(), createStyle(), getStyle(), etc.

const { cloudinary } = require("../cloudinary");

module.exports.indexPage = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds})
}

module.exports.renderNewForm  = async (req, res) => { 
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground); 
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    console.log(geoData.body.features[0].geometry.coordinates);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log("In the controller....");
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!!!')
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground= await Campground.findById(id);
    if(!campground){
        req.flash('error', "Cannot find that campground");
        return res.redirect('/campgrounds');
    }
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You do not have permissionto do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    res.render('campgrounds/edit', { campground})
}


module.exports.updateCampground = async (req, res) => {
    
    const { id } = req.params;
    console.log("In the controller....");
    console.log(req.body);
    // const campground= await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You do not have permissionto do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    console.log(req.body.deleteImages);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        console.log("In The delete...")
        for(let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
        console.log(campground);
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    // const campground= await Campground.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error', 'You do not have permissionto do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted campground");
    res.redirect('/campgrounds');
}