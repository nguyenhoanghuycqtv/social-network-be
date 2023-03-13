const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

  let hashedPassword;
  hashedPassword = await bcrypt.hash(password, 12);

  const userCreated = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    posts: [],
  });

  try {
    await userCreated.save();
  } catch (err) {
    return next(new HttpError("Creating user failed, please try again.", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: userCreated.id, email: userCreated.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Creating user failed, please try again.", 500));
  }

  res
    .status(201)
    .json({ userId: userCreated._id, email: userCreated.email, token: token });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Logging In failed, please try again", 500));
  }
  if (!existingUser) {
    return next(new HttpError("Unauthorized", 401));
  }

  let isValidPassword;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Logging In failed, please try again", 500));
  }
  if (!isValidPassword) {
    return next(new HttpError("Unauthorized", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }

  res.json({
    userId: existingUser._id,
    email: existingUser.email,
    token: token,
  });
};
