const express = require("express");

const commentController = require("../controllers/comment");

const checkAuth = require("../middlewares/check-auth");

const router = express.Router();

router.get("/", commentController.getAllComment);

router.get("/:id", commentController.getCommentsByPostId);

router.use(checkAuth);

router.post("/:id", commentController.createComment);

module.exports = router;
