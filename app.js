const express = require("express");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/post");
const app = express();

app.use("/api/posts", postRoutes);

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({message: err.message || "An error unknow occurred"})
});

app.listen(5000);
