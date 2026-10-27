const Joi = require('joi');


module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required(),
        rating: Joi.number().min(0).max(5).optional(),
        guests: Joi.number().min(1).optional(),
        // Form submits this as text (comma-separated), while edit flows may submit arrays.
        availableDates: Joi.alternatives()
            .try(
                Joi.array().items(Joi.date()),
                Joi.string().allow("", null)
            )
            .optional(),
        image:Joi.string().allow("",null),

    }).required(),
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
})
