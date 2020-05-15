'use strict';

const superagent = require('superagent');

module.exports = function getTrails(req, res) {
  const url = 'https://www.hikingproject.com/data/get-trails';

  const queryParameters = {
    key: process.env.TRAILS_API_KEY,
    lat: req.query.latitude,
    lon: req.query.longitude,
  };

  superagent
    .get(url)
    .query(queryParameters)
    .then((resultFromSuper) => {
      const dataFromJSON = resultFromSuper.body;
      const trailsDataArray = dataFromJSON.trails.map((value) => {
        const trail = new Trail(value);
        return trail;
      });
      res.send(trailsDataArray);
    })
    .catch((error) => {
      res.send(error).status(500);
    });
}

function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.star_votes;
  this.summary = obj.summary;
  this.trail_url = obj.trail_url;
  this.conditions = obj.conditions;
  this.condition_date = obj.conditionDate.split(' ')[0];
  this.condition_time = obj.conditionDate.split(' ')[1];
}