const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { handleMulterError } = require("./middleware/uploadMiddleware");

// Route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Connect to database
connectDB();

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Debug middleware for file uploads (fixed version)
app.use((req, res, next) => {
  if (req.path === "/api/users/avatar") {
    console.log("Avatar upload request:", {
      method: req.method,
      path: req.path,
      contentType: req.headers["content-type"],
      hasAuth: !!req.headers["authorization"],
    });
  }
  next();
});

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);

// Multer error handling (must come after routes)
app.use(handleMulterError);

// Basic route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Online Learning Platform API",
    version: "1.0.0",
  });
});

// Handle undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", err);
  server.close(() => {
    process.exit(1);
  });
});
