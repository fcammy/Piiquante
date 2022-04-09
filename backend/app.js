// Declaring the variables

const express = require('express');
const mongoose = require('mongoose');
const dotenv  = require('dotenv');
const cors  = require('cors');
const morgan = require('morgan')

const path = require('path');

// Declaring routes

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// configuring the environment

dotenv.config();

// connecting DB to application

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!')
    })
    .catch((err) => {
        console.log('Could not connect to MongoDB!');
        console.error(err);
    })

const app = express();


app.use(express.json());

// function to allow cors 
app.use(cors());
app.use(morgan('tiny'))

// Allowing the use of static files

app.use('/images', express.static(path.join(__dirname, 'images')));

// User routes

app.use('/api/auth' , userRoutes);
app.use('/api/sauces', sauceRoutes);



module.exports = app;