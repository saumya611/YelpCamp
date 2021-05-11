const express = require('express');
const app = express();
const path = require('path');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const mongoose = require('mongoose');

const campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new  campground({
            author: '608d654e78ca0a17f8a31947',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo quibusdam laudantium accusamus nulla, sed repellendus adipisci fugit magnam autem expedita laborum deserunt, officiis a ab enim repudiandae explicabo asperiores esse!',
            price: price
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})