'use strict';

// API dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// global variables
const PORT = process.env.PORT || 3000;
const app = express();

//configs
app.use(cors());

const getLocation = require('./locations.js');
const getWeather = require('./weather.js');
const getTrails = require('./trails.js');
const getMovies = require('./movies.js');
const getRestaurants = require('./restaurants.js');

app.get('/', (req, res) => {
  res.redirect(
    'https://codefellows.github.io/code-301-guide/curriculum/city-explorer-app/front-end/'
    );
  });
  app.get('/location', getLocation);
  app.get('/weather', getWeather);
  app.get('/trails', getTrails);
  app.get('/movies', getMovies);
  app.get('/yelp', getRestaurants);
  app.get('*', sendError);
  
  function sendError(req, res) {
    res.status(500).send('This page does not exist Potato');
  }
  
  app.listen(PORT, () => {
    console.log(PORT);
  });

