const axios = require('axios');
const crypto = require('crypto');
const Auth = require('./model');
const email = require('./email');
const genToken = require('../genToken');
const {FE_URL} = process.env;

module.exports = {
  login,
}

async function login(req, res) {
  if(req.user.tkn_refresh === undefined) {
    const {tkn_refresh, ...rest} = req.user;
    req.user = {...rest};
  }
  if(req.user.provider === 'facebook') {
    const {tkn_access} = req.user;
    const proof = crypto.createHmac('sha256', process.env.FACEBOOK_SECRET).update(tkn_access).digest('hex');
    await axios.get(`https://graph.facebook.com/me/picture?redirect&access_token=${tkn_access}&appsecret_proof=${proof}`)
      .then(user => {
        req.user.profile_pic = user.data.url;
      })
      .catch(err => console.error(err))
  }
  console.log('CTRL',req.user);
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