const userRoutes = require("./user");
const postRoutes = require("./post");
const express = require("express");

const router = express.Router();

router.use("/posts", postRoutes);

router.use("/users", userRoutes);

module.exports = router;
