const express = require("express");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/post");
const HttpError = require('./models/http-error')
const app = express();

app.use(bodyParser.json());

app.use("/api/posts", postRoutes);

app.use((req,res,next) => {
    throw new HttpError("Could not find this route", 404)
})

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An error unknow occurred" });
});

app.listen(5000);
