import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import dotenv from "dotenv";
dotenv.config();

const gitHubClientID = process.env.GITHUB_CLIENT_ID as string;
const gitHubClientSecret = process.env.GITHUB_CLIENT_SECRET as string;

passport.use(
  new GitHubStrategy(
    {
      clientID: gitHubClientID,
      clientSecret: gitHubClientSecret,
      callbackURL: "http://localhost:3000/api/v0/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user: any, cb) {
  process.nextTick(function () {
    cb(null, user);
  });
});

passport.deserializeUser(function (user: any, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
