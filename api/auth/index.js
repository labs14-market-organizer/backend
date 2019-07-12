const router = require("express").Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');

require("./passport.js")(passport);

const { FE_URL } = process.env;

const db = require('./model');

// router.get("/square",
//   passport.authenticate("square", {
//     session: false,
//     scope: ["MERCHANT_PROFILE_READ"]
//   })
// );

// router.get("/square/callback",
//   passport.authenticate("square", {
//     failureRedirect: `${FE_URL}`,
//     session: false
//   }),
//   (req, res) => {
//     console.log('CALLBACK')
//     const redirectURL =
//       `${FE_URL}?jwt=${jwt}`;
//     res.redirect(redirectURL);
//   }
// );

router.get("/google",
  passport.authenticate("google", {
    session: false,
    scope: ["openid email profile"]
  })
);

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FE_URL}`,
    session: false
  }),
  (req, res) => {
    console.log("GOOGLE CALLBACK", req.user)
    db.google(req.user)
      .then(user => console.log('THEN', user))
      .catch(err => console.log('CATCH', err))
    const redirectURL = `${FE_URL}?jwt=${jwt}`;
    res.redirect(redirectURL);
  }
);

module.exports = router;
