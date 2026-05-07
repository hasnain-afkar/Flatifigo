const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const listingRoutes = require("./routes/listingRoutes");
const searchRoutes = require("./routes/searchRoutes");
const roommateRoutes = require("./routes/roommateRoutes");
const messageRoutes = require("./routes/messageRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const userRoutes = require("./routes/userRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const upload = require("./middleware/uploadMiddleware");
const { getMyListings, uploadImages } = require("./controllers/listingController");
const { getPlatformStats } = require("./controllers/statsController");

const app = express();
const PORT = process.env.PORT || 5000;
const maxUploads = Number(process.env.MAX_FILE_UPLOADS || 5);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Flatifigo backend is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/roommates", roommateRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reviews", reviewRoutes);

app.post(
  "/api/upload",
  authMiddleware,
  upload.array("images", maxUploads),
  uploadImages
);

app.get("/api/my-listings", authMiddleware, getMyListings);
app.get("/api/stats", getPlatformStats);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((error, _req, res, _next) => {
  if (error.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (
    error.message === "Only image uploads are allowed." ||
    error.message === "Only image and video uploads are allowed."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
