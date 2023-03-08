const { v4: uuidv4 } = require("uuid");

const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const Post = require("../models/post");
const post = require("../models/post");

let DUMMY_POSTS = [
  { id: "p1", title: "MU", content: "ABCXYZ", creator: "u1" },
  { id: "p2", title: "MC", content: "ABCXYZ", creator: "u2" },
];

exports.getPostById = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    return next(new HttpError("Could not find a post", 500));
  }

  if (!post) {
    return next(
      new HttpError("Could not find a post for the provided id", 404)
    );
  }
  res.json({ post: post.toObject({ getters: true }) });
};

exports.getPostsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let posts;
  try {
    posts = await Post.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Could not find posts of user", 500));
  }
  if (!posts || posts.length === 0) {
    return next(
      new HttpError("Could not find posts for the provided userId", 404)
    );
  }
  res.json({ posts: posts.map((post) => post.toObject({ getters: true })) });
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

exports.updatePostById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input passed, please check your data", 422);
  }

  const { title, content } = req.body;
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update post", 500)
    );
  }

  post.title = title;
  post.content = content;

  try {
    post.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update post", 500)
    );
  }

  res.status(200).json({ post: post.toObject({ getters: true }) });
};

exports.deletePostById = async (req, res, next) => {
  const postId = req.params.pid;
  try {
    await Post.findByIdAndRemove(postId);
  } catch (err) {
    return next(new HttpError("Could not delete post", 500));
  }

  res.status(200).json("Deleted");
};
