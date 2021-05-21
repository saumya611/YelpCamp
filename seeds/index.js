const express = require('express');
const app = express();
const path = require('path');
const cities = require('./cities');
const { places, descriptors} = require('./seedHelpers')
const mongoose = require('mongoose');

const Campground = require('../models/campground');
const { randomInt } = require('crypto');

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
    await Campground.deleteMany({});
    for(let i=0;i<200;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '608d654e78ca0a17f8a31947',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo quibusdam laudantium accusamus nulla, sed repellendus adipisci fugit magnam autem expedita laborum deserunt, officiis a ab enim repudiandae explicabo asperiores esse!',
            price: price,
            images: [
                    {
                    //   _id: 60a0c0061dec4533f485c27a,
                    url: 'https://res.cloudinary.com/saumyp/image/upload/v1621147653/YelpCamp/hj6hcjj9xgfb01jq9iqo.jpg',
                    filename: 'YelpCamp/hj6hcjj9xgfb01jq9iqo'
                    }
                ]
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});