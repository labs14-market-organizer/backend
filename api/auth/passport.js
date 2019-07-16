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
  //   return done(null, user);
  // }));

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_ID || 'fallback',
        clientSecret: GOOGLE_SECRET,
        callbackURL: `${BE_URL}/auth/google/callback`
      },
      function(accessToken, refreshToken, profile, done) {
        const { provider, _json } = profile;
        const { sub, email } = _json;
        const user = { provider, prov_user: sub, email };
        return done(null, user);
      }
    )
  );
  
  return passport;
}
