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
  async (req, res) => {
    return db.google(req.user)
      .then(user => {
        const jwt = genToken(user);
        const exp = Date.now() + (1000*60*60*2);
        const redirectURL = `${FE_URL}?jwt=${jwt}&exp=${exp}`;
        res.redirect(redirectURL);
      })
      .catch(err => {
        const redirectURL = `${FE_URL}?err=${err}`;
        res.redirect(redirectURL);
      });
  }
);

module.exports = router;
