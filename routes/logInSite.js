const express = require('express');
const router = express.Router();


router.get('/', function(req, res, next) {
  res.render('logInSite', { title: 'Log In' });
});

module.exports = router;