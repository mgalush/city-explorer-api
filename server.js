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
  const displayName = locationData[0].display_name;
  const city = req.query.city;
  const longitude = locationData[0].lon;
  const latitude = locationData[0].lat;
  let location = new Location(displayName, city, longitude, latitude);
  res.send(location);
});

app.get('/weather', (req, res) => {
  console.log('weather server is running');
  const weatherData = require('./data/weather.json');
  const forecast = weatherData.data[0].weather.description;
  const time = weatherData.data[0].valid_date;
  const location = new Weather(forecast, time);
  res.send(location);
});

function Location(displayName, city, longitude, latitude) {
  this.search_query = city;
  this.formatted_query = displayName;
  this.longitude = longitude;
  this.latitude = latitude;
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}


app.listen(PORT, () => {
  console.log(PORT)
});