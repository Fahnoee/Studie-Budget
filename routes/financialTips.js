const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('financialTips', { title: 'Financial Tips', username: req.session.username });
});

module.exports = router;
