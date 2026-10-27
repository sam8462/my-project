const mongoose = require('mongoose');
let{Schema} = mongoose;
let Review = require('./review.js');



const listingSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    images: [
        {
            url: String,
            filename: String,
        },
    ],
    price : Number,
    location: String,
    country: String,
    rating: {
        type: Number,
        default: 4.8,
        min: 0,
        max: 5,
    },
    guests: {
        type: Number,
        default: 1,
        min: 1,
    },
    availableDates: [
        {
            type: Date,
        },
    ],
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic"],
        default: "Trending"
    },

    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref:'User',
    }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.reviews}});
    }
})

// Keep compatibility with legacy `image` field while enabling `images[]`.
listingSchema.pre("save", function syncImages(next) {
    if ((!this.images || this.images.length === 0) && this.image && this.image.url) {
        this.images = [this.image];
    }
    if ((!this.image || !this.image.url) && this.images && this.images.length > 0) {
        this.image = this.images[0];
    }
    next();
});

module.exports = mongoose.model('Listing', listingSchema);
