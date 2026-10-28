import mongoose from "mongoose";

/**
 * Product Schema
 * Handles product information with category and vendor relationships
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          publicId: String,
          alt: String,
        },
      ],
      validate: {
        validator: function (images) {
          return images && images.length > 0;
        },
        message: "At least one product image is required",
      },
    },
    categories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one category is required",
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stockUnit: {
      type: String,
      enum: ["g", "ml", "piece", "bunch", "packet", "box"],
      required: true,
    },
    sellingType: {
      type: String,
      enum: ["weight", "piece", "range"],
      required: true,
    },
    variants: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        compareAtPrice: {
          type: Number,
          min: 0,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    approxWeight: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    // Season range (1 = Jan ... 12 = Dec). May wrap the year, e.g. 11 to 2.
    seasonStartMonth: {
      type: Number,
      min: 1,
      max: 12,
    },
    seasonEndMonth: {
      type: Number,
      min: 1,
      max: 12,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // nutrition: {
    //   calories: Number,
    //   protein: Number,
    //   carbohydrates: Number,
    //   fat: Number,
    //   fiber: Number,
    // },
    storageInstructions: String,
    healthBenefits: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    // SEO fields
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
productSchema.virtual("featuredImage").get(function () {
  return this.images?.[0]?.url || null;
});

productSchema.virtual("startingPrice").get(function () {
  if (!this.variants?.length) return 0;

  return Math.min(...this.variants.map((variant) => variant.price));
});

// Indexes for better query performance
// Note: slug index is created automatically by unique: true
productSchema.index({ categories: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ "rating.average": -1 });

// Text index for search
productSchema.index({ name: "text", description: "text" });

/**
 * Virtual: product is seasonal when the current month falls inside its
 * season range (the range may wrap around the year end).
 */
productSchema.virtual("isSeasonal").get(function () {
  const start = this.seasonStartMonth;
  const end = this.seasonEndMonth;
  if (!start || !end) return false;
  const month = new Date().getMonth() + 1;
  return start <= end
    ? month >= start && month <= end
    : month >= start || month <= end;
});

/**
 * Virtual to check if product is in stock
 */
productSchema.virtual("inStock").get(function () {
  return this.trackInventory ? this.stock > 0 : true;
});

/**
 * Generate slug from name before saving
 */
productSchema.pre("save", async function (next) {
  // Always generate slug if name exists and slug is not manually set
  if (this.isModified("name") || !this.slug) {
    let slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for uniqueness
    let unique = false;
    let counter = 0;
    let finalSlug = slug;

    while (!unique) {
      const existing = await this.constructor.findOne({
        slug: finalSlug,
        _id: { $ne: this._id },
      });

      if (!existing) {
        unique = true;
      } else {
        counter++;
        finalSlug = `${slug}-${counter}`;
      }
    }

    this.slug = finalSlug;
  }
  next();
});

/**
 * Populate category and vendor on find queries
 */
productSchema.pre(/^find/, function (next) {
  this.populate("categories", "name slug").populate(
    "vendor",
    "firstName lastName email",
  );
  next();
});

export default mongoose.model("Product", productSchema);
