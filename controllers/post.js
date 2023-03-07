const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

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

exports.getPostByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const post = DUMMY_POSTS.find((p) => {
    return p.creator === userId;
  });
  if (!post) {
    return next(
      new HttpError("Could not find posts for the provided userId", 404)
    );
  }
  res.json({ post });
};

exports.createPost = (req, res, next) => {
  const { title, content, creator } = req.body;
  const createdPost = {
    id: uuidv4(),
    title,
    content,
    creator,
  };

  DUMMY_POSTS.push(createdPost);

  res.status(201).json({ post: createdPost });
};

exports.updatePostById = (req, res, next) => {
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
  DUMMY_POSTS = DUMMY_POSTS.filter((p) => p.id !== postId);
  res.status(200).json("Deleted");
};
