import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 3 characters",
    "string.max": "Product name must not exceed 100 characters",
  }),

  description: Joi.string().trim().min(10).max(2000).required().messages({
    "string.empty": "Product description is required",
    "string.min": "Product description must be at least 10 characters",
    "string.max": "Product description must not exceed 2000 characters",
  }),

  categories: Joi.array().items(objectId).min(1).required().messages({
    "array.base": "Categories must be an array",
    "array.min": "Please select at least one category",
    "any.required": "Categories are required",
  }),

  stock: Joi.number().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock is required",
  }),

  stockUnit: Joi.string()
    .valid("g", "ml", "piece", "bunch", "packet", "box")
    .required()
    .messages({
      "any.only": "Invalid stock unit",
      "any.required": "Stock unit is required",
    }),

  sellingType: Joi.string()
    .valid("weight", "piece", "range")
    .required()
    .messages({
      "any.only": "Invalid selling type",
      "any.required": "Selling type is required",
    }),

  variants: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().trim().required(),

        quantity: Joi.number().min(1).required().messages({
          "number.min": "Variant quantity must be at least 1",
        }),

        price: Joi.number().min(0).required().messages({
          "number.min": "Price cannot be negative",
        }),

        compareAtPrice: Joi.number().min(0).optional(),

        isDefault: Joi.boolean().optional(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one variant is required",
      "any.required": "Variants are required",
    }),

  approxWeight: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
  })
    .custom((value, helpers) => {
      if (
        value?.min !== undefined &&
        value?.max !== undefined &&
        value.min > value.max
      ) {
        return helpers.error("any.invalid");
      }

      return value;
    })
    .messages({
      "any.invalid": "Approx weight minimum cannot be greater than maximum",
    })
    .optional(),

  vendor: objectId.required().messages({
    "any.required": "Vendor is required",
  }),

  isOrganic: Joi.boolean().optional(),

  seasonStartMonth: Joi.number().integer().min(1).max(12).allow(null).optional(),

  seasonEndMonth: Joi.number().integer().min(1).max(12).allow(null).optional(),

  isBestSeller: Joi.boolean().optional(),

  storageInstructions: Joi.string().allow("").optional(),

  healthBenefits: Joi.array().items(Joi.string().trim()).optional(),

  isActive: Joi.boolean().optional(),

  isFeatured: Joi.boolean().optional(),

  trackInventory: Joi.boolean().optional(),

  sku: Joi.string().trim().allow("").optional(),

  metaTitle: Joi.string().max(100).allow("").optional(),

  metaDescription: Joi.string().max(300).allow("").optional(),
});
