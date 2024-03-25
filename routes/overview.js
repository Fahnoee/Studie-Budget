const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("overview", {
    title: "Student Budget",
    totalAmount: "4000",
    spentAmount: "3000",
    leftAmount: "1000",
  });
});

/*
router.get("/overview", function (req, res) {
  res.redirect("/overview");
});
*/

module.exports = router;
