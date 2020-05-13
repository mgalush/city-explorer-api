'use strict';

// API dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// global variables
const PORT = process.env.PORT || 3000;
const app = express();

//configs
app.use(cors()); 

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('*', sendError);

function getLocation(req, res) {
  const locationData = require('./data/location.json');
  const displayName = locationData[0].display_name;
  const city = req.query.city;
  const longitude = locationData[0].lon;
  const latitude = locationData[0].lat;
  let location = new Location(displayName, city, longitude, latitude);
  res.send(location);
}

function getWeather(req, res) {
  const weatherData = require('./data/weather.json');
  const forecast = weatherData.data[0].weather.description;
  const date = new Date(weatherData.data[0].valid_date);
  const time = date.toDateString();
  const location = new Weather(forecast, time);
  res.send([location]);
}

function sendError(req, res) {
  res.status(500).send('This page does not exist');
}

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