const express = require("express");
const router = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.render('overview', { title: 'Overview', username: req.session.username });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
