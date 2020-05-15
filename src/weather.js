'use strict';

const superagent = require('superagent');

module.exports = function getWeather(req, res) {
  const queryForSuper = {
    lat: req.query.latitude,
    lon: req.query.longitude,
  };

  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';

  const queryParameters = {
    key: process.env.WEATHER_API_KEY,
    lat: req.query.latitude,
    lon: req.query.longitude,
    days: 7,
  };

  superagent
    .get(url)
    .query(queryParameters)
    .then((resultFromSuper) => {
      const dataFromJSON = resultFromSuper.body;
      const weatherDataArray = dataFromJSON.data.map((value) => {
        const forecast = value.weather.description;
        const date = new Date(value.ts * 1000);
        const time = date.toDateString();
        const location = new Weather(forecast, time);
        return location;
      });
      res.send(weatherDataArray);
    })
    .catch((error) => {
      res.send(error).status(500);
    });
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}