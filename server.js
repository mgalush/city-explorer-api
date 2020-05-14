'use strict';

// API dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// global variables
const PORT = process.env.PORT || 3000;
const app = express();

//configs
app.use(cors()); 
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

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

  // if location is in db, get data from db 
  // else, send data
  const sqlQuery = 'SELECT * FROM locations WHERE search_query=$1';
  const sqlValues = [city];
  client.query(sqlQuery, sqlValues)
    .then(resultFromSql => {
      if(resultFromSql.rowCount !== 0) {
        res.send(resultFromSql.rows[0])
      } else {
        superagent.get(url)
          .query(queryParameters)
          .then(resultFromSuper => {
            // send data
            let newLocation = new Location(city, resultFromSuper.body[0]);
            
            // store data in db
            const sqlQuery = 'INSERT INTO locations (search_query, formatted_query, longitude, latitude) VALUES ($1, $2, $3, $4);'
            const valueArray = [newLocation.search_query, newLocation.formatted_query, newLocation.longitude, newLocation.latitude];
            client.query(sqlQuery, valueArray);

            res.send(newLocation);
          })
          .catch(error => {
            res.send(error).status(500);
          });
        }
      })
      
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
    lon: req.query.longitude,
    days: 7
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
    res.send(error).status(500);
  });
}

function sendError(req, res) {
  res.status(500).send('This page does not exist');
}

function Location(city, obj) {
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.longitude = obj.lon;
  this.latitude = obj.lat;
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