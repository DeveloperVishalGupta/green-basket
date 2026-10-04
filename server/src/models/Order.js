import mongoose from "mongoose";

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
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
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
        variant: String,
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
        // How many units of this line will actually be fulfilled/charged.
        // Starts equal to `quantity`; only ever changed by an explicit
        // customer resolution below (e.g. accepting a partial-stock qty,
        // or removing the item entirely sets this to 0). `quantity` itself
        // is never edited — it stays the true record of what was ordered.
        fulfilledQuantity: {
          type: Number,
        },
        // Set by the delivery-day (or admin-triggered) availability check
        // in orderFulfillmentService — never by order creation. Cleared
        // once the item re-passes verification (e.g. restocked) or once a
        // resolution below has been applied.
        availabilityIssue: {
          // Named `issueType`, not `type` — a `type` key directly on this
          // object would make Mongoose treat the whole `availabilityIssue`
          // object as a SchemaType definition instead of a nested path,
          // silently dropping detectedAt/availableQty/newPrice below.
          issueType: {
            type: String,
            enum: ["unavailable", "partial_stock", "price_change"],
          },
          detectedAt: Date,
          // For partial_stock/unavailable — units actually in stock.
          availableQty: Number,
          // For price_change — the product's current variant price.
          newPrice: Number,
        },
        // How an `availabilityIssue` above was settled — by the customer
        // from the order-detail page, or by an admin on their behalf.
        resolution: {
          action: {
            type: String,
            enum: ["replace", "remove", "accept_price", "accept_partial"],
          },
          resolvedAt: Date,
          resolvedBy: {
            type: String,
            enum: ["customer", "admin"],
          },
          // Snapshotted product swapped in for "replace" — independent of
          // the live Product document, same reasoning as the line item
          // itself.
          replacement: {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: String,
            slug: String,
            image: String,
            variant: String,
            price: Number,
          },
        },
      },
    ],
    shippingAddress: {
      label: String,
      street: {
        type: String,
        required: true,
        maxlength: [185, "Delivery address cannot exceed 185 characters"],
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
        default: "India",
      },
      phone: String,
      // Human-readable address as confirmed on the checkout map (reverse
      // geocoded from `location`), e.g. "12 MG Road, Andheri, Mumbai,
      // Maharashtra 400058, India". Snapshotted at order time so it never
      // changes even if the customer edits/deletes the saved address later.
      formattedAddress: String,
      // Coordinates for this order's delivery location, when available.
      // Stored as its own snapshot (not a reference to the User's address
      // document) so later edits to the saved address never affect this
      // order's delivery location.
      location: {
        lat: Number,
        lng: Number,
      },
    },
    payment: {
      method: {
        type: String,
        enum: ["cod", "card", "upi", "netbanking"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
      // How the money was actually collected at the door (the order's
      // `method` stays what the customer chose at checkout, e.g. "cod").
      collectedMethod: {
        type: String,
        enum: ["cash", "upi"],
      },
      // Who recorded the payment (the delivery partner / admin who
      // confirmed cash or UPI received).
      collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      collectedAt: Date,
    },
    // Delivery partner responsible for this order. Set when a partner
    // accepts it (or an admin assigns it); only that partner (and admins)
    // may change the order's delivery/payment status.
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryPartnerAssignedAt: Date,
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
    // Day-of (or admin-triggered) re-verification of stock/price for a
    // scheduled Today/Tomorrow order — see orderFulfillmentService. Kept
    // separate from `pricing` so "the final order differs from the
    // original" can always be reported accurately.
    fulfillment: {
      // Snapshot of pricing.total exactly as placed — pricing.total may
      // be recalculated as issues get resolved, but this never changes.
      originalTotal: Number,
      lastVerifiedAt: Date,
      // True whenever any item currently has an unresolved
      // availabilityIssue — drives the "action needed" banner on the
      // order-detail page.
      needsCustomerAction: {
        type: Boolean,
        default: false,
      },
      // Set once pricing.total has actually changed from originalTotal as
      // a result of a resolution, so the customer is told exactly once
      // (see notifyCustomerOfOrderUpdate) rather than on every re-check.
      customerNotifiedOfChangeAt: Date,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
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
      enum: ["customer", "admin"],
    },
    notes: String,
    deliveryDate: Date,
    deliveryTimeSlot: {
      type: String,
    },

    editHistory: [
      {
        editedAt: {
          type: Date,
          default: Date.now,
        },
        editedBy: {
          type: String,
          enum: ["customer", "admin"],
          default: "customer",
        },
        changes: [
          {
            field: String,
            previous: mongoose.Schema.Types.Mixed,
            updated: mongoose.Schema.Types.Mixed,
          },
        ],
      },
    ],

    // Razorpay payment integration
    razorpayOrderId: String,
    razorpayPaymentId: String,

    // Shiprocket integration fields
    shiprocketOrderId: String,
    shiprocketShipmentId: Number,
    courierName: String,
    awbCode: String,

    // Guards to ensure WhatsApp notifications are sent at most once per
    // order, even if payment verification and the Razorpay webhook race
    whatsappNotified: {
      customer: {
        type: Boolean,
        default: false,
      },
      vendor: {
        type: Boolean,
        default: false,
      },
    },

    // Vendor's Confirm/Reject response to the new-order WhatsApp prompt.
    // messageId is Meta's id for that prompt, used to correlate/dedupe
    // the button-tap webhook; respondedAt is set once, on first transition
    // out of "pending" (see WhatsappEvent for delivery-level idempotency).
    vendorWhatsapp: {
      status: {
        type: String,
        enum: ["pending", "confirmed", "rejected"],
        default: "pending",
      },
      messageId: String,
      respondedAt: Date,
      // wa.me click-to-chat link produced by the "link" messaging
      // provider while no programmatic gateway is configured.
      link: String,
    },

    // Outbound WhatsApp message to the customer. Which fields are set
    // depends on the active messaging provider: `link` for the default
    // click-to-chat provider, `messageId` once the Cloud API is enabled.
    customerWhatsapp: {
      provider: String,
      link: String,
      messageId: String,
      sentAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
orderSchema.index({ user: 1 });
// Note: orderNumber index is created automatically by unique: true
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Generate unique order number
 */
orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  let unique = false;
  let counter = 1;
  let orderNumber;

  while (!unique) {
    orderNumber = `ORD${year}${month}${day}${counter.toString().padStart(4, "0")}`;
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
orderSchema.methods.updateStatus = function (newStatus, note = "") {
  this.status = newStatus;

  this.statusHistory.push({
    status: newStatus,
    note,
    updatedAt: new Date(),
  });

  // Update specific timestamps based on status
  if (newStatus === "delivered") {
    this.deliveredAt = new Date();
  } else if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
  }

  return this.save();
};

/**
 * Populate user and product details
 */
orderSchema.pre(/^find/, function (next) {
  this.populate("user", "firstName lastName email phone").populate(
    "items.product",
    "name slug images price",
  );
  next();
});

export default mongoose.model("Order", orderSchema);
