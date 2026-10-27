const Listing = require("../models/listing.js");

function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function buildDateRange(startDate, endDate) {
    const dates = [];
    let start = normalizeDate(startDate);
    let end = normalizeDate(endDate);
    if (start > end) {
        [start, end] = [end, start];
    }

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
        dates.push(new Date(current));
    }
    return dates;
}

function getNextWeekendRange() {
    const today = normalizeDate(new Date());
    const day = today.getDay(); // 0: Sunday, 6: Saturday
    const daysUntilFriday = (5 - day + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);

    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return { friday, sunday };
}

function getCardImage(listing) {
    if (listing.images && listing.images.length > 0 && listing.images[0].url) {
        return listing.images[0];
    }
    if (listing.image && listing.image.url) {
        return listing.image;
    }
    return { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", filename: "fallback" };
}

function parseAvailableDates(value) {
    if (!value) return [];
    const values = Array.isArray(value) ? value : String(value).split(",");
    return values
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => normalizeDate(new Date(item)))
        .filter((item) => !Number.isNaN(item.getTime()));
}

function addPresentationFields(listings, favoriteSet) {
    return listings.map((listing) => ({
        ...listing.toObject(),
        cardImage: getCardImage(listing),
        isFavorite: favoriteSet.has(listing._id.toString()),
    }));
}

async function getFavoriteSet(req) {
    if (!req.user) return new Set();
    const populatedUser = await req.user.populate("favorites");
    return new Set(populatedUser.favorites.map((item) => item._id.toString()));
}

async function getLocationSuggestions() {
    const locations = await Listing.distinct("location");
    return locations.filter(Boolean).slice(0, 20);
}

module.exports.index = async (req, res) => {
    const favoriteSet = await getFavoriteSet(req);
    const { friday, sunday } = getNextWeekendRange();
    const weekendDates = buildDateRange(friday, sunday);

    const [popularListings, weekendListings, allListings, locationSuggestions] = await Promise.all([
        Listing.find({}).sort({ rating: -1, price: 1 }).limit(8),
        Listing.find({ availableDates: { $all: weekendDates } }).sort({ rating: -1 }).limit(8),
        Listing.find({}).sort({ _id: -1 }).limit(16),
        getLocationSuggestions(),
    ]);

    res.render("./listing/home.ejs", {
        allListings: addPresentationFields(allListings, favoriteSet),
        popularListings: addPresentationFields(popularListings, favoriteSet),
        weekendListings: addPresentationFields(weekendListings, favoriteSet),
        locationSuggestions,
        searchQuery: {},
        weekendLabel: `${friday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        pageTitle: "Explore Stays",
        isSearchPage: false,
        totalResults: allListings.length,
    });
};

module.exports.search = async (req, res) => {
    const { location, checkIn, checkOut, guests } = req.query;
    const query = {};

    if (location) {
        query.$or = [
            { location: { $regex: location, $options: "i" } },
            { country: { $regex: location, $options: "i" } },
            { title: { $regex: location, $options: "i" } },
        ];
    }
    if (guests) {
        query.guests = { $gte: Number(guests) || 1 };
    }
    if (checkIn && checkOut) {
        const stayDates = buildDateRange(checkIn, checkOut);
        query.availableDates = { $all: stayDates };
    }

    const favoriteSet = await getFavoriteSet(req);
    const { friday, sunday } = getNextWeekendRange();
    const weekendDates = buildDateRange(friday, sunday);

    const [listings, popularListings, weekendListings, locationSuggestions] = await Promise.all([
        Listing.find(query).sort({ rating: -1, price: 1 }),
        Listing.find({}).sort({ rating: -1, price: 1 }).limit(8),
        Listing.find({ availableDates: { $all: weekendDates } }).sort({ rating: -1 }).limit(8),
        getLocationSuggestions(),
    ]);

    res.render("./listing/home.ejs", {
        allListings: addPresentationFields(listings, favoriteSet),
        popularListings: addPresentationFields(popularListings, favoriteSet),
        weekendListings: addPresentationFields(weekendListings, favoriteSet),
        locationSuggestions,
        searchQuery: { location, checkIn, checkOut, guests },
        weekendLabel: "This Weekend",
        pageTitle: "Search Results",
        isSearchPage: true,
        totalResults: listings.length,
    });
};

module.exports.popular = async (req, res) => {
    const favoriteSet = await getFavoriteSet(req);
    const [popularListings, locationSuggestions] = await Promise.all([
        Listing.find({}).sort({ rating: -1, price: 1 }).limit(24),
        getLocationSuggestions(),
    ]);

    res.render("./listing/home.ejs", {
        allListings: addPresentationFields(popularListings, favoriteSet),
        popularListings: addPresentationFields(popularListings.slice(0, 8), favoriteSet),
        weekendListings: [],
        locationSuggestions,
        searchQuery: {},
        weekendLabel: "This Weekend",
        pageTitle: "Popular Homes",
        isSearchPage: false,
        totalResults: popularListings.length,
    });
};

module.exports.weekend = async (req, res) => {
    const favoriteSet = await getFavoriteSet(req);
    const { friday, sunday } = getNextWeekendRange();
    const weekendDates = buildDateRange(friday, sunday);
    const [weekendListings, popularListings, locationSuggestions] = await Promise.all([
        Listing.find({ availableDates: { $all: weekendDates } }).sort({ rating: -1, price: 1 }),
        Listing.find({}).sort({ rating: -1, price: 1 }).limit(8),
        getLocationSuggestions(),
    ]);

    res.render("./listing/home.ejs", {
        allListings: addPresentationFields(weekendListings, favoriteSet),
        popularListings: addPresentationFields(popularListings, favoriteSet),
        weekendListings: addPresentationFields(weekendListings, favoriteSet),
        locationSuggestions,
        searchQuery: {},
        weekendLabel: `${friday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        pageTitle: "Available This Weekend",
        isSearchPage: false,
        totalResults: weekendListings.length,
    });
};

module.exports.newListingForm = (req, res) => {
    res.render("./listing/new.ejs");
};

module.exports.createNewListing = async (req, res) => {
    const payload = { ...req.body.listing };
    payload.guests = Number(payload.guests || 1);
    payload.rating = Number(payload.rating || 4.8);
    payload.availableDates = parseAvailableDates(payload.availableDates);
    const newListing = new Listing(payload);

    if (req.file) {
        const { path: url, filename } = req.file;
        newListing.image = { url, filename };
        newListing.images = [{ url, filename }];
    }

    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Successfully created the listing");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const editableListing = await Listing.findById(id);
    if (!editableListing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listing/edit.ejs", { editableListing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const payload = { ...req.body.listing };
    payload.guests = Number(payload.guests || 1);
    payload.rating = Number(payload.rating || 4.8);
    payload.availableDates = parseAvailableDates(payload.availableDates);

    const updatedListing = await Listing.findByIdAndUpdate(id, payload, { new: true });

    if (req.file) {
        const { path: url, filename } = req.file;
        updatedListing.image = { url, filename };
        updatedListing.images = [{ url, filename }];
        await updatedListing.save();
    }

    req.flash("success", "Successfully updated the listing");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted listing successfully");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const favoriteSet = await getFavoriteSet(req);
    const currListing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!currListing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    const listingForView = {
        ...currListing.toObject(),
        cardImage: getCardImage(currListing),
        isFavorite: favoriteSet.has(currListing._id.toString()),
    };

    res.render("./listing/show.ejs", { currListing: listingForView });
};

// Backward compatibility for existing route naming.
module.exports.homeRoute = module.exports.index;
