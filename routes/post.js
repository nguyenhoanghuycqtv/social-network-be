const express = require("express");

const { check } = require("express-validator");

const postController = require("../controllers/post");

const fileUpload = require("../middlewares/file-upload");

const router = express.Router();

router.get("/:pid", postController.getPostById);

router.get("/user/:uid", postController.getPostsByUserId);

router.post(
  "/",
  fileUpload.single("image"),
  [(check("title").not().isEmpty(), check("content").not().isEmpty())],
  postController.createPost
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("content").not().isEmpty()],
  postController.updatePostById
);

router.delete("/:pid", postController.deletePostById);

module.exports = router;
