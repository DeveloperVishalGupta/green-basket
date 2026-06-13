import mongoose from 'mongoose';

/**
 * Product Schema
 * Handles product information with category and vendor relationships
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
        validator: function(images) {
          return images && images.length > 0;
        },
        message: 'At least one product image is required'
      }
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sizes: [String],
    colors: [String],
    tags: [String],
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
    // Sales tracking
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // SEO fields
    metaTitle: String,
    metaDescription: String,
    
    // Grocery-specific fields
    unit: {
      type: String,
      enum: ['kg', 'g', 'piece', 'bunch', 'dozen', 'box', 'packet'],
      default: 'kg',
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isSeasonalFresh: {
      type: Boolean,
      default: false,
    },
    isBestSelling: {
      type: Boolean,
      default: false,
    },
    nutritionalInfo: {
      calories: String,
      protein: String,
      carbohydrates: String,
      fat: String,
      fiber: String,
      vitamins: [String],
      minerals: [String],
    },
    storageInstructions: String,
    benefits: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: slug index is created automatically by unique: true
productSchema.index({ category: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

/**
 * Virtual for discount percentage
 */
productSchema.virtual('discountPercentage').get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) {
    return 0;
  }
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

/**
 * Virtual to check if product is in stock
 */
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

/**
 * Generate slug from name before saving
 */
productSchema.pre('save', async function (next) {
  // Always generate slug if name exists and slug is not manually set
  if (this.isModified('name') || !this.slug) {
    let slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check for uniqueness
    let unique = false;
    let counter = 0;
    let finalSlug = slug;
    
    while (!unique) {
      const existing = await this.constructor.findOne({ 
        slug: finalSlug,
        _id: { $ne: this._id }
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
  this.populate('category', 'name slug')
      .populate('vendor', 'firstName lastName email');
  next();
});

export default mongoose.model('Product', productSchema);
