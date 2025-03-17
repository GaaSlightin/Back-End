import express from "express"
import dotenv from "dotenv"
dotenv.config()
const app=express()
const port=process.env.PORT||8080

app.use(express.json())
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

