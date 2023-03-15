const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  location: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
});

module.exports = mongoose.model("Comment", commentSchema);
