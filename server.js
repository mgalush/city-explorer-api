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
  if (!city) {
    res.status(404).send('You need to pass in a city query parameter');
  }
  const queryForSuper = {
    lat: req.query.latitude,
    lon: req.query.longitude
  };
  const url = 'https://us1.locationiq.com/v1/search.php';
  const queryParameters = {
    q: city,
    key: process.env.GEOCODE_API_KEY,
    format: 'json'
  };
  superagent.get(url)
    .query(queryParameters)
    .then(resultFromSuper => {
      const longitude = resultFromSuper.body[0].lon;
      const latitude = resultFromSuper.body[0].lat;
      const displayName = resultFromSuper.body[0].display_name;
      let location = new Location(displayName, city, longitude, latitude);
      res.send(location);
    })
    .catch(error => {
      console.log(error);
      res.send(error).status(500);
    });
}

function getWeather(req, res) {
  const weatherData = require('./data/weather.json');
  const weatherDataArray = weatherData.data.map((value) => {
    const forecast = value.weather.description;
    const date = new Date(value.valid_date);
    const time = date.toDateString();
    const location = new Weather(forecast, time);
    return location;
  })

  res.send(weatherDataArray);
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