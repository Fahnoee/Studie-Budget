const express = require('express');
const router = express.Router();


router.get('/', function(req, res, next) {
  res.render('signUpSide', { title: 'Sign Up' });
});

module.exports = router;