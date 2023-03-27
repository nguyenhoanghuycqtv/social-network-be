const express = require("express");

const { check } = require("express-validator");

const userController = require("../controllers/user");

const fileUpload = require("../middlewares/file-upload");

const router = express.Router();

router.get("/", userController.getAllUser);

router.get("/:id", userController.getUser);

router.get("/:id/friends", userController.getFriends);

router.post("/:id/add-friend", userController.addFriend);

router.delete("/:id/delete-friend", userController.deleteFriend);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.signup
);

router.post("/login", userController.login);

module.exports = router;
