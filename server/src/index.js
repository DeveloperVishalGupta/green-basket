import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import "./config/env.js";
dotenv.config();
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
// import './config/env.js';
import swaggerUi from "swagger-ui-express";

import connectDatabase from "./config/database.js";
import swaggerSpec from "./config/swagger.js";
import orderVerificationJob from "./jobs/orderVerificationJob.js";
import errorHandler from "./middleware/errorHandler.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import productRoutes from "./routes/product.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";
import userRoutes from "./routes/user.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

const customCss = `
.swagger-ui .topbar {
  display: none;
}
`;

// Initialize express app
const app = express();

// Connect to database
connectDatabase();

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss,
  }),
);

// Middleware
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Request logging
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://iqrafashions.com",
  "https://www.iqrafashions.com",
];

const envAllowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...envAllowedOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
); // CORS
app.use(
  express.json({
    limit: "10mb",
    // Keep the raw bytes around so the WhatsApp webhook can verify Meta's
    // X-Hub-Signature-256 header, which is computed over the raw body.
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
); // Parse JSON bodies with 10MB limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies with 10MB limit
app.use(cookieParser()); // Parse cookies

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Green Basket API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products",
      categories: "/api/categories",
      cart: "/api/cart",
      orders: "/api/orders",
      payment: "/api/payment",
      admin: "/api/admin",
      wishlist: "/api/wishlist",
      notifications: "/api/notifications",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/webhooks/whatsapp", whatsappRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
  orderVerificationJob.start();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;
