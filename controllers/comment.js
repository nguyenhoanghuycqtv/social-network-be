// const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");

const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.createComment = async (req, res, next) => {
  const { content, creator, location } = req.body;

  const createdComment = new Comment({
    content,
    creator,
    location,
  });

  let user;
  let post;

  try {
    user = await User.findById(creator);
    post = await Post.findById(location);
    console.log(location);
  } catch {
    return next(
      new HttpError("Creating comment failed, please try again", 500)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdComment.save({ session: sess });
    user.comments.push(createdComment);
    post.comments.push(createdComment);
    await user.save({ session: sess });
    await post.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating post failed, please try again.", 500));
  }

  //   if (!user && !post) {
  //     return next(new HttpError("Could not find comment", 404));
  //   }

  res.status(200).json({ comment: createdComment });
};

exports.getCommentsByPost = async (req, res, next) => {
  let comments;
  comments = await Comment.find().populate("location creator");

  res.status(200).json({
    comments: comments.map((comment) => comment.toObject({ getters: true })),
  });
};
