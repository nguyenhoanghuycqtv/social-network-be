const express = require("express");

const commentController = require("../controllers/comment");

const router = express.Router();

router.get("/", commentController.getCommentsByPost);

router.post("/", commentController.createComment);

module.exports = router;
