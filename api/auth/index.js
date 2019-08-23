const router = require("express").Router();
const passport = require("passport");
require("./passport.js")(passport);
const db = require('./model');
const genToken = require('./genToken');
const sg = require('../sendgrid');
const { FE_URL } = process.env;

// *** Sets common expiration for JWT and FE in ms ***
const expire = 1000*60*60*2; // 2 hours

// Sets common signup email message
const msg = email => ([
  email,
  'Thank you for joining Cloud Stands',
  `<p>Please log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and create your market or vendor profile to get started.</p>`
])

router.get("/square",
  passport.authenticate("square", {
    session: false,
    scope: ["MERCHANT_PROFILE_READ"]
  })
);
router.get("/square/callback",
  passport.authenticate("square", {
    failureRedirect: `${FE_URL}`,
    session: false
  }),
  async (req, res) => {
    return db.square(req.user)
      .then(user => {
        if(user.newAcct && user.email) {
          sg(...msg(user.email));
        }
        const jwt = genToken(user, expire);
        const exp = Date.now() + expire; // provides parallel to JWT exp
        const redirectURL = `${FE_URL}/auth/token?jwt=${jwt}&exp=${exp}`;
        res.redirect(redirectURL);
      })
      .catch(err => {
        console.error(err);
        // Handle auth failure w/ our user DB
        const redirectURL = `${FE_URL}/auth/token?err=500`;
        res.redirect(redirectURL);
      });
  }
);

// FE endpoint for redirect to Google
router.get("/google",
  passport.authenticate("google", {
    session: false, // using JWT instead of sessions
    scope: ["openid email profile"]
  })
);
// Google endpoint for redirect to FE
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FE_URL}`, // Handle auth failure on Google's side
    session: false // using JWT instead of sessions
  }),
  async (req, res) => {
    return db.google(req.user)
      .then(user => {
        if(user.newAcct && user.email) {
          sg(...msg(user.email));
        }
        const jwt = genToken(user, expire);
        const exp = Date.now() + expire; // provides parallel to JWT exp
        const redirectURL = `${FE_URL}/auth/token?jwt=${jwt}&exp=${exp}`;
        res.redirect(redirectURL);
      })
      .catch(err => {
        console.error(err)
        // Handle auth failure w/ our user DB
        const redirectURL = `${FE_URL}/auth/token?err=500`;
        res.redirect(redirectURL);
      });
  }
);

// FE endpoint for redirect to Facebook
router.get("/facebook",
  passport.authenticate("facebook", {
    session: false, // using JWT instead of sessions
    scope: ["email"]
  })
);
// Facebook endpoint for redirect to FE
router.get("/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${FE_URL}`, // Handle auth failure on Facebook's side
    session: false // using JWT instead of sessions
  }),
  async (req, res) => {
    return db.facebook(req.user)
      .then(user => {
        if(user.newAcct && user.email) {
          sg(...msg(user.email));
        }
        const jwt = genToken(user, expire);
        const exp = Date.now() + expire; // provides parallel to JWT exp
        const redirectURL = `${FE_URL}/auth/token?jwt=${jwt}&exp=${exp}`;
        res.redirect(redirectURL);
      })
      .catch(err => {
        // Handle auth failure w/ our user DB
        const redirectURL = `${FE_URL}/auth/token?err=500`;
        res.redirect(redirectURL);
      });
  }
);

module.exports = router;