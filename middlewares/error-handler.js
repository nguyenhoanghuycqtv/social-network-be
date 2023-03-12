const fs = require("fs");
const HttpError = require("../models/http-error");

const handleNotFound = (req, res, next) => {
  throw new HttpError("Could not find this route", 404);
};

const handleError = (err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An error unknow occurred" });
};

module.exports = {
  handleError,
  handleNotFound,
};
