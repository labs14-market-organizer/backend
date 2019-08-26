const router = require('express').Router({mergeParams: true});
const {originCORS} = require('../../middleware');
const passport = require('passport');
require('../passport')(passport);
const {FE_URL} = process.env;
const ctrl = require('../controllers');

// FE endpoint for redirect to Square
router.get("/",
  // originCORS(),
  passport.authenticate("square", {
    session: false,
    scope: ["MERCHANT_PROFILE_READ"]
  })
);

// Square endpoint for redirect to FE
router.get("/callback",
  // originCORS(['https://www.squareup.com']),
  passport.authenticate("square", {
    failureRedirect: `${FE_URL}`,
    session: false
  }),
  ctrl.login
);

module.exports = router;
