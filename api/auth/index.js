const router = require("express").Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');

require("./passport.js")(passport);

const { FE_URL } = process.env;

const db = require('./model');

// Generate JWT
function genToken(user) {
  const { id } = user;
  const payload = { subject: id };
  const jwtSecret = process.env.JWT_SECRET;
  const opt = { expiresIn: "2h" };
  return jwt.sign(payload, jwtSecret, opt);
}

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
        const jwt = genToken(user);
        const exp = Date.now() + (1000*60*60*2); // provides parallel to JWT exp
        const redirectURL = `${FE_URL}?jwt=${jwt}&exp=${exp}`;
        res.redirect(redirectURL);
      })
      .catch(err => {
        // Handle auth failure w/ our user DB
        const redirectURL = `${FE_URL}?err=${err}`;
        res.redirect(redirectURL);
      });
  }
);

module.exports = router;
