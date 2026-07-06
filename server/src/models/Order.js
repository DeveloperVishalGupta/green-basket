import mongoose from 'mongoose';

/**
 * Order Schema
 * Handles customer orders with items, shipping, and payment details
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        slug: String,
        image: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: String,
        color: String,
        price: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      label: String,
      street: {
        type: String,
        required: true,
        maxlength: [185, 'Delivery address cannot exceed 185 characters'],
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: 'India',
      },
      phone: String,
    },
    payment: {
      method: {
        type: String,
        enum: ['cod', 'card', 'upi', 'netbanking'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },
    refund: {
      id: String, // Razorpay refund ID
      paymentId: String, // Razorpay payment ID
      amount: Number, // Refunded amount in rupees
      currency: String, // Currency (INR)
      status: String, // Razorpay refund status (processed, pending, failed)
      speed: String, // Refund speed (normal, optimum)
      notes: mongoose.Schema.Types.Mixed, // Custom notes
      createdAt: Date, // When refund was initiated
      processedAt: Date, // When refund was processed
      batchId: String, // Razorpay batch ID
      failureReason: String, // Error message if refund fails
      // Complete Razorpay response for timeline display
      razorpayData: mongoose.Schema.Types.Mixed,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        default: 0,
      },
      shippingFee: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    coupon: {
      code: String,
      discount: Number,
      freeDelivery: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    trackingNumber: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin'],
    },
    notes: String,
    deliveryDate: Date,
    deliveryTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
    },
    
    // Razorpay payment integration
    razorpayOrderId: String,
    razorpayPaymentId: String,
    
    // Shiprocket integration fields
    shiprocketOrderId: String,
    shiprocketShipmentId: Number,
    courierName: String,
    awbCode: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
orderSchema.index({ user: 1 });
// Note: orderNumber index is created automatically by unique: true
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Generate unique order number
 */
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  let unique = false;
  let counter = 1;
  let orderNumber;
  
  while (!unique) {
    orderNumber = `ORD${year}${month}${day}${counter.toString().padStart(4, '0')}`;
    const existing = await this.constructor.findOne({ orderNumber });
    
    if (!existing) {
      unique = true;
    } else {
      counter++;
    }
  }
  
  this.orderNumber = orderNumber;
  next();
});

/**
 * Method to update order status
 * @param {string} newStatus - New status
 * @param {string} note - Optional note
 */
orderSchema.methods.updateStatus = function (newStatus, note = '') {
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedAt: new Date(),
  });
  
  // Update specific timestamps based on status
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

/**
 * Populate user and product details
 */
orderSchema.pre(/^find/, function (next) {
  this.populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name slug images price');
  next();
});

export default mongoose.model('Order', orderSchema);
