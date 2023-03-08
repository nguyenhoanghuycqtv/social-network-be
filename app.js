const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");
const HttpError = require("./models/http-error");
const app = express();

app.use(bodyParser.json());

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
});

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An error unknow occurred" });
});

mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.4vkklpk.mongodb.net/posts?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected");
    app.listen(5000);
  })
  .catch((err) => console.log(err));
