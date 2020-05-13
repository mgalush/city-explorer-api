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
app.get('/trails', getTrails);
app.get('*', sendError);

function getLocation(req, res) {
  const city = req.query.city;
  if (!city) {
    res.status(404).send('You need to pass in a city query parameter');
  }

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
  const queryForSuper = {
    lat: req.query.latitude,
    lon: req.query.longitude
  };

  const url = 'https://api.weatherbit.io/v2.0/current';

  const queryParameters = {
    key: process.env.WEATHER_API_KEY,
    lat: req.query.latitude,
    lon: req.query.longitude
  };

  superagent.get(url)
    .query(queryParameters)
    .then(resultFromSuper => {
      const dataFromJSON = resultFromSuper.body;
      const weatherDataArray = dataFromJSON.data.map((value) => {
        const forecast = value.weather.description;
        const date = new Date(value.last_ob_time);
        const time = date.toDateString();
        const location = new Weather(forecast, time);
        return location;
      })
      res.send(weatherDataArray);
    })
    .catch(error => {
      console.log(error);
      res.send(error).status(500);
    });

}

function getTrails(req, res) {
  const url = 'https://www.hikingproject.com/data/get-trails';

  const queryParameters = {
    key: process.env.TRAILS_API_KEY,
    lat: req.query.latitude,
    lon: req.query.longitude
  }

  superagent.get(url)
  .query(queryParameters)
  .then(resultFromSuper => {
    const dataFromJSON = resultFromSuper.body;
    const trailsDataArray = dataFromJSON.trails.map((value) => {
      const name = value.name;
      const location = value.location;
      const length = value.length;
      const stars = value.stars;
      const star_votes = value.star_votes;
      const summary = value.summary
      const trail_url = value.url;
      const conditions = value.conditionDetails;
      const date = new Date(value.conditionDate);
      // TODO: figure out how to format date
      const condition_date = date;
      const condition_time = date;
      const trail = new Trail (name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time)
      return trail;
    })
    res.send(trailsDataArray);
  })
  .catch(error => {
    console.log(error);
    res.send(error).status(500);
  });
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

function Trail(name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time) {
  this.name = name;
  this.location = location;
  this.length = length;
  this.stars = stars;
  this.star_votes = star_votes;
  this.summary = summary;
  this.trail_url = trail_url;
  this.conditions = conditions;
  this.condition_date = condition_date;
  this.condition_time = condition_time;
}


app.listen(PORT, () => {
  console.log(PORT)
});