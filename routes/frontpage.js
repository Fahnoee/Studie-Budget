const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('frontpage', { title: 'Frontpage' });
});

websiteName = "Student Budget";

module.exports = router;
