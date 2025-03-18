import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import dotenv from "dotenv";
import { ExtendedProfile } from "../interfaces/auth.interfaces";
dotenv.config();

const gitHubClientID = process.env.GITHUB_CLIENT_ID as string;
const gitHubClientSecret = process.env.GITHUB_CLIENT_SECRET as string;
const baseUrl = process.env.BASE_URL as string;
passport.use(new GitHubStrategy({
   clientID: gitHubClientID,
   clientSecret: gitHubClientSecret,
   callbackURL: `${baseUrl}/api/v0/auth/github/callback`,
},
async (accessToken, refreshToken, profile, done) => {
   const extendedProfile = profile as ExtendedProfile;
   extendedProfile.accessToken = accessToken;
   return done(null, extendedProfile);
}));

passport.serializeUser(function(user: any, cb) {
   process.nextTick(function() {
     cb(null, user);
   });
});

passport.deserializeUser(function(user: any, cb) {
   process.nextTick(function() {
     return cb(null, user);
   });
});