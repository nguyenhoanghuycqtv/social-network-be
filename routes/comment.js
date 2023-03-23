const express = require("express");

const commentController = require("../controllers/comment");

const router = express.Router();

router.get("/", commentController.getAllComment);

router.get("/:id", commentController.getCommentsByPostId);

router.post("/:id", commentController.createComment);

module.exports = router;
