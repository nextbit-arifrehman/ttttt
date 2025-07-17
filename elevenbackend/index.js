const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// Import route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const offerRoutes = require("./routes/offerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3001", 
      /.*\.replit\.dev$/
    ],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Client
const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("real-estate-db");

    // Attach database to request
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // Route registrations
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/properties", propertyRoutes);
    app.use("/api/offers", offerRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/wishlist", wishlistRoutes);
    app.use("/api/payment", paymentRoutes);

    // Root endpoint
    app.get("/", (req, res) => {
      res.send("Real Estate Platform Backend is Running 🚀");
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).send({ message: "Route not found" });
    });

    // Start server
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
}

startServer();
