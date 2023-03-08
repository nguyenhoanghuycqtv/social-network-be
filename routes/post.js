const express = require("express");

const { check } = require("express-validator");

const postController = require("../controllers/post");

const router = express.Router();

router.get("/:pid", postController.getPostById);

router.get("/user/:uid", postController.getPostsByUserId);

router.post(
  "/",
  [check("title").not().isEmpty(), check("content").not().isEmpty()],
  postController.createPost
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(),
  check("content").not().isEmpty()],
  postController.updatePostById
);

router.delete("/:pid", postController.deletePostById);

module.exports = router;
