import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

// Passport jwt strategy
// https://www.passportjs.org/packages/passport-jwt/
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      // Normally you would look up user from DB here
      const user = await User.findById(jwt_payload.userId);
      if (!user) return done(null, false);
      else return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

// Passport Google OAuth Strategy
// https://www.passportjs.org/packages/passport-google-oauth20/
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_BASE_URL}/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            name: profile.displayName,
            password: null, // Placeholder, since Google handles password
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;
