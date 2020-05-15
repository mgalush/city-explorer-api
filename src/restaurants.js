'use strict';

// API dependencies
// require('dotenv').config();
const superagent = require('superagent');

module.exports = function getRestaurants(req, res) {
  const url = 'https://api.yelp.com/v3/businesses/search';

  const queryParameters = {
    location: req.query.search_query,
    key: process.env.YELP_API_KEY,
  };

  superagent
    .get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryParameters)
    .then((resultFromSuper) => {
      const dataFromJSON = resultFromSuper.body.businesses;
      const restaurantsDataArray = dataFromJSON.map((value) => {
        const restaurant = new Restaurant(value);
        return restaurant;
      });
      res.send(restaurantsDataArray);
    })
    .catch((error) => {
      res.send(error).status(500);
    });
}

function Restaurant(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}