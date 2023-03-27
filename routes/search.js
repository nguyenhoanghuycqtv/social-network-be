const express = require("express");
const searchController = require("../controllers/search");
const router = express.Router();

router.get("/users/:name", searchController.searchUsers);

module.exports = router;
