const router = require('express').Router();
const {originCORS} = require('../../middleware');
const passport = require('passport');
require('../passport')(passport);
const {FE_URL} = process.env;
const ctrl = require('../controllers');

// FE endpoint for redirect to Google
router.get("/",
  originCORS(),
  passport.authenticate("google", {
    session: false, // using JWT instead of sessions
    scope: ["openid email profile"]
  })
);

// Google endpoint for redirect to FE
router.get("/callback",
  originCORS(['https://www.google.com']),
  passport.authenticate("google", {
    failureRedirect: `${FE_URL}`, // Handle auth failure on Google's side
    session: false // using JWT instead of sessions
  }),
  ctrl.login
);

module.exports = router;
