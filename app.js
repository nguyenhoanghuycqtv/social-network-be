require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");
const { handleNotFound, handleError } = require("./middlewares/error-handler");

const app = express();

// connect mongo
require("./configs/mongo-connection");

app.use("/upload/images", express.static(path.join("upload", "images")));
app.use(bodyParser.json());
app.use(cors());

// route
app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);

app.use("/api/comments", commentRoutes);

// handle error
app.use(handleNotFound);
app.use(handleError);

app.listen(process.env.PORT);
