const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next("Could not fetch users data", 500);
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input, Please enter data again", 422));
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Signing Up failed, please try again", 500));
  }
  if (existingUser) {
    return next(new HttpError("User has existed", 422));
  }

  const userCreated = new User({
    name,
    email,
    password,
    image: req.file.path,
    posts: [],
  });

  try {
    await userCreated.save();
  } catch (err) {
    return next(new HttpError("Creating user failed, please try again.", 500));
  }

  res.status(201).json({ user: userCreated.toObject({ getters: true }) });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Logging In failed, please try again", 500));
  }
  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError("Unauthorized", 401));
  }
  res.json({
    message: "Logged in",
    user: existingUser.toObject({ getters: true }),
  });
};
