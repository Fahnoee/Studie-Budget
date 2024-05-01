const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.username) {
    res.render('settingSite', { title: 'Settings', username: req.session.username });
  } else {
    res.redirect('/login');
  }
});


module.exports = router;