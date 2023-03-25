const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.getAllUser = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password").populate("posts");
  } catch (err) {
    return next("Could not fetch users data", 500);
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.getUser = async (req, res, next) => {
  let userId = req.params.id;
  let user;
  try {
    user = await User.findById(userId).populate("posts");
  } catch (err) {
    return next("Could not fetch users data", 500);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.getFriends = async (req, res, next) => {
  let userId = req.params.id;
  let user;
  try {
    user = await User.findById(userId).populate("friends");
  } catch (err) {
    return next("Could not fetch friends of UserID provided");
  }

  res.status(200).json({
    friends: user.friends.map((friend) => friend.toObject({ getters: true })),
  });
};

exports.addFriend = async (req, res, next) => {
  let userId = req.params.id;
  const { friendId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({ message: "Invalid user ID or friend ID" });
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId).populate("posts friends");
  if (user.friends.includes(friendId)) {
    return res.status(400).json({ message: "Friend already added" });
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.friends.push(friendId);
    await user.save({ session: sess });
    friend.friends.push(userId);
    await friend.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(HttpError("Add friend failed", 500));
  }
  res.status(200).json({ friendAdded: friend });
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
    friends: [],
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

  res.status(201).json({
    userId: userCreated._id,
    email: userCreated.email,
    token: token,
    name: userCreated.name,
    image: userCreated.image,
  });
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
    // isValidPassword = password === existingUser.password;
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
    name: existingUser.name,
    image: existingUser.image,
  });
};
