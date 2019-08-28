const SquareStrategy = require("passport-square").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const axios = require('axios');
const crypto = require('crypto');
const {
  BE_URL,
  SQUARE_SB, SQUARE_SB_ID, SQUARE_SB_SECRET,
  SQUARE_ID, SQUARE_SECRET,
  GOOGLE_ID, GOOGLE_SECRET,
  FACEBOOK_ID, FACEBOOK_SECRET,
} = process.env;

module.exports = (passport) => {
  // passport.serializeUser((user, done)=>{
    //   console.log('SERIALIZE')
    //   done(null, user.id)
    // });
    // passport.deserializeUser((id, done)=>{
      //   console.log('DESERIALIZE')
      //   done(null, id);
      // });
  // ^^^ SERIALIZE/DESERIALIZE ONLY SEEMS TO BE USED W/ SESSIONS

  passport.use(new SquareStrategy({
    // Square OAuth apparently doesn't support their own sandbox
    clientID: SQUARE_ID || 'test',
    clientSecret: SQUARE_SECRET,
    callbackURL: `${BE_URL}/auth/square/callback`
  },
      function(tkn_access, tkn_refresh, profile, done) {
        const { provider, id, email } = profile;
        const user = {
          email,
          provider,
          prov_user: id,
          tkn_access,
          tkn_refresh
        };
        return done(null, user); // pass user data to callback
      }
  ));

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_ID || 'test', // Fallback to prevent tests from failing
        clientSecret: GOOGLE_SECRET,
        callbackURL: `${BE_URL}/auth/google/callback` // BE endpoint that Google redirects to
      },
      function(tkn_access, tkn_refresh, profile, done) {
        const { provider, id, emails, photos } = profile;
        const email = emails[0].value;
        const profile_pic = photos[0].value;
        const user = { 
          email,
          profile_pic,
          provider,
          prov_user: id,
          tkn_access
        };
        return done(null, user); // pass user data to callback
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_ID || 'test', // Fallback to prevent tests from failing
        clientSecret: FACEBOOK_SECRET,
        callbackURL: `${BE_URL}/auth/facebook/callback`, // BE endpoint that Facebook redirects to
        profileFields: ['id', 'email', 'picture.type(large)'],
        enableProof: true
      },
      async function(tkn_access, tkn_refresh, profile, done) {
        const { provider, id, emails } = profile;
        const email = emails[0].value; 
        const proof = crypto
          .createHmac('sha256', process.env.FACEBOOK_SECRET)
          .update(tkn_access)
          .digest('hex');
        let profile_pic;
        await axios.get(`https://graph.facebook.com/me/picture?redirect&access_token=${tkn_access}&appsecret_proof=${proof}`)
          .then(user => {
            console.log('FB',user.data)
            console.log('FB',user.data.url)
            profile_pic = user.data.url;
          })
          .catch(err => console.error(err))
        const user = { 
          email,
          profile_pic,
          provider,
          prov_user: id,
          tkn_access
        };
        return done(null, user); // pass user data to callback
      }
    )
  );
  return passport;
}
