const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap.js");
const ListingController = require("../controller/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// Homepage and listing collections
router.get("/", asyncWrap(ListingController.index));
router.get("/search", asyncWrap(ListingController.search));
router.get("/popular", asyncWrap(ListingController.popular));
router.get("/weekend", asyncWrap(ListingController.weekend));

// Create listing
router.get("/new", isLoggedIn, ListingController.newListingForm);
router.post("/create", isLoggedIn, upload.single("listing[image]"), validateListing, asyncWrap(ListingController.createNewListing));

// Edit and update listing
router.get("/edit/:id", isLoggedIn, isOwner, asyncWrap(ListingController.editListing));
router.put("/update/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, asyncWrap(ListingController.updateListing));

// Delete listing
router.delete("/delete/:id", isLoggedIn, isOwner, asyncWrap(ListingController.destroyListing));

// Show listing detail
router.get("/:id", asyncWrap(ListingController.showListing));

module.exports = router;
