const express = require("express");

const HttpError = require("../models/http-error");

const router = express.Router();

const DUMMY_POSTS = [
  { id: "p1", title: "MU", content: "ABCXYZ", creator: "u1" },
  { id: "p2", title: "MC", content: "ABCXYZ", creator: "u2" },
];

router.get("/:pid", (req, res, next) => {
  const postId = req.params.pid;
  const post = DUMMY_POSTS.find((p) => {
    return p.id === postId;
  });

  if (!post) {
    throw new HttpError("Could not find a post for the provided id", 404);
  }
  res.json({ post });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const post = DUMMY_POSTS.find((p) => {
    return p.creator === userId;
  });
  if (!post) {
    return next(new HttpError("Could not find posts for the provided userId", 404));
  }
  res.json({ post });
});

module.exports = router;
