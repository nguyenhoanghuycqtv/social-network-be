const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);
