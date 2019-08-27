const axios = require('axios');
const Auth = require('./model');
const email = require('./email');
const genToken = require('../genToken');
const {FE_URL} = process.env;

module.exports = {
  login,
}

async function login(req, res) {
  if(req.body.provider === 'facebook') {
    req.body.profile_pic = await axios.get(`
    https://graph.facebook.com/me/picture?redirect&access_token=${req.tkn_access}`);
  }
  if(!!req.body.tkn_refresh) {
    const {tkn_refresh, ...rest} = req.body;
    req.body = {...rest};
  }
  console.log('CTRL',req.body);
  return Auth.findOrCreate(req.user)
    .then(user => {
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