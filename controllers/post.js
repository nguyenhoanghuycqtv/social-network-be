const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");

const Post = require("../models/post");
const User = require("../models/user");

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
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { title, content, creator } = req.body;
  const createdPost = new Post({
    title,
    content,
    image:
      "https://media-cldnry.s-nbcnews.com/image/upload/rockcms/2022-05/220517-evan-spiegel-jm-1058-bf9cae.jpg",
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating post failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user", 404));
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating post failed, please try again.", 500));
  }

  res.status(201).json({ post: createdPost });
};

exports.updatePostById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError("Invalid input passed, please check your data", 422);
    }

    const { title, content } = req.body;
    const postId = req.params.pid;
    const postRes = await Post.findByIdAndUpdate(postId, { title, content });
    res.status(200).json({ post: postRes });
  } catch (err) {
    next(err);
  }
};

exports.deletePostById = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId).populate("creator");
    console.log(post);
  } catch (err) {
    return next(new HttpError("Could not delete post", 500));
  }
  if (!post) {
    return next(new HttpError("Could not find post for this id", 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Post.findByIdAndRemove(post._id, { session: sess });
    post.creator.posts.pull(post);
    await post.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete post", 500));
  }

  res.status(200).json("Deleted");
};
