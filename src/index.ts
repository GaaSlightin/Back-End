import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "./db/db";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler.middleware"; // Import the error handler
import cors from "cors"
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

(async () => {
  await dbConnection();
})();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:4200", // Explicitly set the origin
  credentials: true
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// API routes
app.use("/api/v0/", routes);

app.use("/", (req, res) => {
  res.json({
    status: "Done",
    message: "server running",
  });
});

// Use the error handling middleware
app.use(errorHandler);

app.listen(port, (err) => {
  if (err) {
    console.log("Cannot initialize the server");
  }
  console.log(`Running server on port ${port}`);
});
export default app;