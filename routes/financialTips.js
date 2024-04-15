const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('financialTips', { title: 'Financial Tips' });
});

module.exports = router;