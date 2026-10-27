const User = require("../models/user.js");

module.exports.toggleFavorite = async (req, res) => {
    const listingId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const alreadyFavorite = user.favorites.some((favoriteId) => favoriteId.equals(listingId));

    if (alreadyFavorite) {
        user.favorites = user.favorites.filter((favoriteId) => !favoriteId.equals(listingId));
        req.flash("success", "Removed from favorites");
    } else {
        user.favorites.push(listingId);
        req.flash("success", "Added to favorites");
    }

    await user.save();

    const redirectBack = req.get("referer") || "/listings";
    res.redirect(redirectBack);
};
