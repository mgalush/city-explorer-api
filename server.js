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

app.get('/location', (req, res) => {
  console.log('location server is running');
  const locationData = require('./data/location.json');
  const city = req.query.city;
  let location = new Location(locationData[0], city) 
  res.send(location);
});

// const coordinates = [];
// const latitude = locationData[0].lat;
// const longitude = locationData[0].lon;
// coordinates.push(latitude, longitude);

app.get('/weather', (req, res) => {
  console.log('weather server is running');
  const weatherData = require('./data/weather.json');
  
  res.send();
});

function Location(location, city) {
  this.search_query = city;
  this.formatted_query = location.display_name;
  this.longitude = location.lon;
  this.latitude = location.lat;
}


app.listen(PORT, () => {
  console.log(PORT)
});