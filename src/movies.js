'use strict';

const superagent = require('superagent');

module.exports = function getMovies(req, res) {
  const url = 'https://api.themoviedb.org/3/search/movie/';

  const queryParameters = {
    query: req.query.search_query,
    api_key: process.env.MOVIE_API_KEY,
  };

  superagent
    .get(url)
    .query(queryParameters)
    .then((resultFromSuper) => {
      const dataFromJSON = resultFromSuper.body.results;
      const movieDataArray = dataFromJSON.map((value) => {
        const movie = new Movie(value);
        return movie;
      });
      res.send(movieDataArray);
    })
    .catch((error) => {
      res.send(error).status(500);
    });
}

function Movie(obj) {
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w500' + obj.poster_path;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}
