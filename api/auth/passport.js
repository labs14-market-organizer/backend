const SquareStrategy = require("passport-square").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const {
  BE_URL,
  SQUARE_ID, SQUARE_SECRET,
  GOOGLE_ID, GOOGLE_SECRET
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

  // passport.use(new SquareStrategy({
  //   clientID: SQUARE_ID,
  //   clientSecret: SQUARE_SECRET,
  //   callbackURL: `${BE_URL}/auth/square/callback`
  // },
  // function(accessToken, refreshToken, profile, done) {
  //   return done(null, profile);
  // }));

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_ID || 'fallback',
        clientSecret: GOOGLE_SECRET,
        callbackURL: `${BE_URL}/auth/google/callback` // BE endpoint that Google redirects to
      },
      function(accessToken, refreshToken, profile, done) {
        const { provider, id, emails } = profile;
        const email = emails[0].value;
        const user = { provider, prov_user: id, email };
        return done(null, user); // pass user data to callback
      }
    )
  );
  
  return passport;
}
