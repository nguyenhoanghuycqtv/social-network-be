const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

DUMMY_USERS = [
  {
    id: "u1",
    name: "Nguyen Hoang Huy",
    email: "nguyenhoanghuycqtv@gmail.com",
    password: "123456",
  },
];

exports.getUsers = (req, res, next) => {
  const users = [...DUMMY_USERS];

  res.json({ users });
};

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input, Please enter data again");
  }
  const { name, email, password } = req.body;
  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("Email has existed, please try different email");
  }
  const userCreated = { id: uuidv4(), name, email, password };
  DUMMY_USERS.push(userCreated);
  res.json({ user: userCreated });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Could not find provided email or password", 401);
  }
  res.json({ message: "Logged in" });
};
