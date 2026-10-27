const mongoose = require('mongoose');
const  {Schema} = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    favorites: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },
    ],
})

userSchema.plugin(passportLocalMongoose);// passportLoacalmongoose provide hashing, salting, automatically;
module.exports = mongoose.model("User",userSchema);
