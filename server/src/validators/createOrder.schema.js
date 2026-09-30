import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: objectId.required().messages({
          "any.required": "Product is required",
        }),

        quantity: Joi.number().integer().min(1).required().messages({
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),

        variant: Joi.string().trim().required().messages({
          "string.empty": "Variant is required",
        }),

        name: Joi.string().trim().required().messages({
          "string.empty": "Product name is required",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Order must contain at least one item",
      "any.required": "Items are required",
    }),

  shippingAddress: Joi.object({
    id: objectId.optional(),
    _id: objectId.optional(),

    label: Joi.string().trim().required(),

    fullName: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Full name is required",
    }),

    phone: Joi.string()
      .trim()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid phone number",
        "string.empty": "Phone number is required",
      }),

    street: Joi.string().trim().max(185).required().messages({
      "string.empty": "Street is required",
      "string.max": "Street cannot exceed 185 characters",
    }),

    area: Joi.string().allow("").optional(),

    city: Joi.string().trim().required().messages({
      "string.empty": "City is required",
    }),

    state: Joi.string().trim().required().messages({
      "string.empty": "State is required",
    }),

    zipCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid zip code",
      }),

    country: Joi.string().trim().required(),

    landmark: Joi.string().allow("").optional(),

    isDefault: Joi.boolean().optional(),

    // Reverse-geocoded label for the confirmed map pin (see location
    // below). Optional — reverse geocoding can fail even after the pin
    // itself is confirmed — but persisted whenever available.
    formattedAddress: Joi.string().trim().allow("").optional(),

    // Optional: a precise lat/lng for the delivery pin, when available.
    location: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).optional(),
  })
    .required()
    .messages({
      "any.required": "Shipping address is required",
    }),

  pricing: Joi.object({
    subtotal: Joi.number().min(0).required(),

    discount: Joi.number().min(0).default(0),

    shippingFee: Joi.number().min(0).required(),

    total: Joi.number().min(0).required(),
  }).required(),

  deliveryDate: Joi.date().iso().required().messages({
    "date.format": "Invalid delivery date",
    "any.required": "Delivery date is required",
  }),

  // deliveryTimeSlot: Joi.string()
  //   .pattern(/^\d{1,2}-\d{1,2}(-pm)?$/)
  //   .required()
  //   .messages({
  //     "string.pattern.base": "Invalid delivery time slot",
  //   }),
  deliveryTimeSlot: Joi.string().trim().min(1).required().messages({
    "string.empty": "Delivery time slot is required",
    "any.required": "Delivery time slot is required",
  }),

  // deliveryFee: Joi.number().min(0).required(),

  // subtotal: Joi.number().min(0).required(),

  // totalAmount: Joi.number().min(0).required(),
});
