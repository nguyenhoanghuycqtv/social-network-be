const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.getAllPost = async (req, res, next) => {
  let posts;
  posts = await Post.find().populate("creator comments");
  res
    .status(200)
    .json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

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
  let userWithPosts;
  try {
    userWithPosts = await User.findById(userId).populate("posts");
  } catch (err) {
    return next(new HttpError("Fetching failed, please try again", 500));
  }
  // if (!userWithPosts.posts || userWithPosts.posts.length === 0) {
  //   return next(
  //     new HttpError("Could not find posts for the provided userId", 404)
  //   );
  // }
  res.json({
    posts: userWithPosts.posts.map((post) => post.toObject({ getters: true })),
    // user: userWithPosts.toObject({ getters: true }),
  });
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
    image: req.file.path,
    creator,
    comments: [],
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

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      return next(new HttpError("Could not find post for this id", 404));
    }

    if (post.creator.id !== req.userData.userId) {
      return next(
        new HttpError("You are not allowed to delete this post", 401)
      );
    }

    const postUpdated = await post.updateOne({ title, content });
    res.status(200).json({ post: postUpdated });
  } catch (err) {
    next(err);
  }
};

exports.deletePostById = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId).populate("creator comments");
  } catch (err) {
    return next(new HttpError("Could not delete post", 500));
  }
  if (!post) {
    return next(new HttpError("Could not find post for this id", 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Comment.deleteMany({ location: postId }, { session: sess });
    await Post.findByIdAndRemove(postId, { session: sess });
    post.creator.posts.pull(post);
    await post.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete post", 500));
  }

  res.status(200).json("Deleted");
};
