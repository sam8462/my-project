const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap.js");
const FavoriteController = require("../controller/favorite.js");
const { isLoggedIn } = require("../middleware.js");

router.post("/:id", isLoggedIn, asyncWrap(FavoriteController.toggleFavorite));

module.exports = router;
