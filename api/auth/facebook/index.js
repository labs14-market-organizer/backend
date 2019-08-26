const router = require('express').Router({mergeParams: true});
const {originCORS} = require('../../middleware');
const passport = require('passport');
require('../passport')(passport);
const {FE_URL} = process.env;
const ctrl = require('../controllers');

// FE endpoint for redirect to Facebook
router.get("/",
  originCORS(),
  passport.authenticate("facebook", {
    session: false, // using JWT instead of sessions
    scope: ["email"]
  })
);

// Facebook endpoint for redirect to FE
router.get("/callback",
  (req, res, next) => {
    console.log('FOOBAR');
    next();
  },
  originCORS(['https://www.facebook.com']),
  passport.authenticate("facebook", {
    failureRedirect: `${FE_URL}`, // Handle auth failure on Facebook's side
    session: false // using JWT instead of sessions
  }),
  ctrl.login
);

module.exports = router;
