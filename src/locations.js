'use strict';

// API dependencies
const superagent = require('superagent');
const pg = require('pg');

//configs
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

module.exports = function getLocation(req, res) {
  const city = req.query.city;
  if (!city) {
    res.status(404).send('You need to pass in a city query parameter');
  }

  const url = 'https://us1.locationiq.com/v1/search.php';
  const queryParameters = {
    q: city,
    key: process.env.GEOCODE_API_KEY,
    format: 'json',
  };

  // if location is in db, get data from db
  // else, send data
  const sqlQuery = 'SELECT * FROM locations WHERE search_query=$1';
  const sqlValues = [city];
  client.query(sqlQuery, sqlValues).then((resultFromSql) => {
    if (resultFromSql.rowCount !== 0) {
      res.send(resultFromSql.rows[0]);
    } else {
      superagent
        .get(url)
        .query(queryParameters)
        .then((resultFromSuper) => {
          // send data
          let newLocation = new Location(city, resultFromSuper.body[0]);
          // store data in db
          const sqlQuery =
            'INSERT INTO locations (search_query, formatted_query, longitude, latitude) VALUES ($1, $2, $3, $4);';
          const valueArray = [
            newLocation.search_query,
            newLocation.formatted_query,
            newLocation.longitude,
            newLocation.latitude,
          ];
          client.query(sqlQuery, valueArray);
          res.send(newLocation);
        })
        .catch((error) => {
          res.send(error).status(500);
        });
    }
  });
}

function Location(city, obj) {
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.longitude = obj.lon;
  this.latitude = obj.lat;
}