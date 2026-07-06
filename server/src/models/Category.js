import mongoose from "mongoose";

/**
 * Category Schema
 * Handles product categorization with hierarchical structure
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for better query performance
// Note: slug index is created automatically by unique: true
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

/**
 * Generate slug from name before saving
 */
categorySchema.pre("save", async function (next) {
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

export default mongoose.model("Category", categorySchema);
