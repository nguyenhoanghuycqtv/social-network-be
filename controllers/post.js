const { v4: uuidv4 } = require("uuid");

const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const Post = require("../models/post");

let DUMMY_POSTS = [
  { id: "p1", title: "MU", content: "ABCXYZ", creator: "u1" },
  { id: "p2", title: "MC", content: "ABCXYZ", creator: "u2" },
];

exports.getPostById = (req, res, next) => {
  const postId = req.params.pid;
  const post = DUMMY_POSTS.find((p) => {
    return p.id === postId;
  });

  if (!post) {
    throw new HttpError("Could not find a post for the provided id", 404);
  }
  res.json({ post });
};

exports.getPostsByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const posts = DUMMY_POSTS.filter((p) => {
    return p.creator === userId;
  });
  if (!posts || posts.length === 0) {
    return next(
      new HttpError("Could not find posts for the provided userId", 404)
    );
  }
  res.json({ posts });
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input passed, please check your data", 422);
  }

  const { title, content, creator } = req.body;
  const createdPost = new Post({
    title,
    content,
    image:
      "https://media-cldnry.s-nbcnews.com/image/upload/rockcms/2022-05/220517-evan-spiegel-jm-1058-bf9cae.jpg",
    creator,
  });
  try {
    await createdPost.save();
  } catch (err) {
    return next(new HttpError("Creating post failed, please try again.", 500));
  }

  res.status(201).json({ post: createdPost });
};

exports.updatePostById = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input passed, please check your data", 422);
  }

  const { title, content } = req.body;
  const postId = req.params.pid;
  const updatedPost = { ...DUMMY_POSTS.find((p) => p.id === postId) };
  const postIndex = DUMMY_POSTS.findIndex((p) => p.id === postId);
  updatedPost.title = title;
  updatedPost.content = content;
  DUMMY_POSTS[postIndex] = updatedPost;
  //   DUMMY_POSTS[postIndex].title = title;
  //   DUMMY_POSTS[postIndex].content = content;

  res.status(200).json({ post: updatedPost });
};

exports.deletePostById = (req, res, next) => {
  const postId = req.params.pid;
  if (!DUMMY_POSTS.find((p) => p.id === postId)) {
    throw new HttpError("Could not find the id provided", 404);
  }

  DUMMY_POSTS = DUMMY_POSTS.filter((p) => p.id !== postId);
  res.status(200).json("Deleted");
};
