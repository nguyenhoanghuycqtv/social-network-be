const express = require("express");

const postController = require("../controllers/post");

const router = express.Router();

router.get("/:pid", postController.getPostById);

router.get("/user/:uid", postController.getPostByUserId);

router.post("/", postController.createPost);

router.patch("/:pid", postController.updatePostById);

router.delete("/:pid", postController.deletePostById);

module.exports = router;
