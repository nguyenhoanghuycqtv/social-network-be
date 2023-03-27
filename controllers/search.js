const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const User = require("../models/user");

exports.searchUsers = async (req, res, next) => {
  const name = req.params.name;
  try {
    const users = await User.find({ name: { $regex: new RegExp(name, "i") } });
    res.status(200).json({ users: users });
  } catch (err) {
    return next(new HttpError("Can not find users with this name", 500));
  }
};
