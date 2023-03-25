// const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.createComment = async (req, res, next) => {
  const postId = req.params.id;

  const { content, creator, location } = req.body;

  const createdComment = new Comment({
    content,
    creator,
    location,
  });

  let user;
  let post;

  try {
    post = await Post.findById(location);
  } catch {
    return next(
      new HttpError("Creating comment failed, please try again", 500)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdComment.save({ session: sess });
    post.comments.push(createdComment);
    await post.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating post failed, please try again.", 500));
  }

  let comments = await Comment.find({ location: postId })
    .populate("creator location")
    .then((result) => result.pop());

  res.status(200).json({ comment: comments });
};

exports.getAllComment = async (req, res, next) => {
  let comments;
  comments = await Comment.find().populate("location creator");

  res.status(200).json({
    comments: comments.map((comment) => comment.toObject({ getters: true })),
  });
};

exports.getCommentsByPostId = async (req, res, next) => {
  let comments;
  let postId = req.params.id;
  comments = await Comment.find({ location: postId }).populate(
    "location creator"
  );

  res.status(200).json({ comments });
};
