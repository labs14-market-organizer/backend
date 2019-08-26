const Auth = require('./model');
const email = require('./email');
const genToken = require('../genToken');
const {FE_URL} = process.env;

module.exports = {
  login,
}

async function login(req, res) {
  return Auth.findOrCreate(req.user)
    .then(user => {
      console.log(user.new_acct, user.email)
      if(user.new_acct && user.email) {
        email.welcome(user.email);
      }
      const redirectURL = genToken(user, true);
      res.redirect(redirectURL);
    })
    .catch(err => {
      console.error(err)
      // Handle auth failure w/ our user DB
      const redirectURL = `${FE_URL}/auth/token?err=500`;
      res.redirect(redirectURL);
    });
}