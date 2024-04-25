const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('helpSite', { title: 'Help Tutorial' });
});


module.exports = router;
