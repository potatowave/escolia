const User = require('../models/User');

module.exports = (knex) => {

  /**
  * Deserialize for passport, find and return the user id
  */

  function myDeserialize(id, cb) {
    User(knex).findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  }

  /**
  * Check if user is logged in
  */

  function authenticatedMiddleware(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    if(!req.isAuthenticated()) {
      console.log('NOT AUTH!!');
      return res.status(401).send('Not authenticated');
    }
    next();
  };

  return {
    myDeserialize,
    authenticatedMiddleware
  };
}