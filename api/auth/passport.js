const SquareStrategy = require("passport-square").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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
      function(accessToken, refreshToken, profile, done) {
        // console.log(profile)
        const { provider, id, email } = profile;
        const user = { provider, prov_user: id, email };
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
      function(accessToken, refreshToken, profile, done) {
        console.log(profile)
        const { provider, id, emails, photos } = profile;
        const email = emails[0].value;
        const profile_pic = photos[0].value;
        const user = { provider, prov_user: id, email };
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
        profileFields: ['id', 'email'],
        enableProof: true
      },
      function(accessToken, refreshToken, profile, done) {
        console.log('PASSPORT')
        console.log(profile._json)
        const { provider, id, emails } = profile;
        const email = emails[0].value; 
        const user = { provider, prov_user: id, email };
        return done(null, user); // pass user data to callback
      }
    )
  );
  return passport;
}
