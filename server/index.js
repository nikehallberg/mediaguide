// Import required dependencies
import express from "express"; // Web framework for Node.js
import dotenv from "dotenv"; // Load environment variables from .env file
import mongoose from "mongoose"; // MongoDB object modeling library
import cors from "cors"; // Enable Cross-Origin Resource Sharing
import cookieParser from "cookie-parser"; // Parse cookies from HTTP requests
import bcrypt from "bcryptjs"; // Hash and compare passwords securely
import jwt from "jsonwebtoken"; // Create and verify JSON Web Tokens
 
// Load environment variables from .env file
dotenv.config();
 
// Create Express application instance
const app = express();
// Set server port from environment variable or default to 4000
const PORT = process.env.PORT || 4000;
// Define allowed frontend origins for CORS
const FRONTEND_ORIGINS = [
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  "http://localhost:5174", // Additional port for development
];
// JWT secret key for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || "replace_me";
 
// Configure middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies from requests
// Configure CORS to allow requests from specific origins
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if request origin is in allowed list
    if (FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject requests from unauthorized origins
    return callback(new Error('Not allowed by CORS'));
  }, 
  credentials: true // Allow cookies to be sent with requests
}));
 
// MongoDB Schema Definitions

// User Model - Stores user account information
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Unique username for login
  email: { type: String, required: true, unique: true }, // Unique email address
  password: { type: String, required: true }, // Hashed password (never store plain text)
  dateJoined: { type: Date, default: Date.now }, // Account creation timestamp
});
const User = mongoose.model("User", UserSchema);

// Watchlist Model - Stores items users want to watch/read later
const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user who added item
  itemType: { type: String, required: true }, // Type of media: "movie", "show", "book", "song"
  itemId: { type: String, required: true }, // Unique identifier for the item (usually title)
  itemTitle: { type: String, required: true }, // Display name of the item
  dateAdded: { type: Date, default: Date.now }, // When item was added to watchlist
});
const Watchlist = mongoose.model("Watchlist", WatchlistSchema);

// Review Model - Stores user reviews and ratings for media items
const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user who wrote review
  itemType: { type: String, required: true }, // Type of media: "movie", "show", "book", "song"
  itemId: { type: String, required: true }, // Unique identifier for the item
  itemTitle: { type: String, required: true }, // Display name of the item
  rating: { type: Number, min: 1, max: 5 }, // Star rating from 1-5
  reviewText: { type: String, required: true }, // Written review content
  dateCreated: { type: Date, default: Date.now }, // When review was created
});
const Review = mongoose.model("Review", ReviewSchema);

// Thumbs Up/Down Model - Stores user votes (like/dislike) for media items
const ThumbsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user who voted
  itemType: { type: String, required: true }, // Type of media: "movie", "show", "book", "song"
  itemId: { type: String, required: true }, // Unique identifier for the item
  itemTitle: { type: String, required: true }, // Display name of the item
  voteType: { type: String, enum: ['up', 'down'], required: true }, // Vote type: thumbs up or down
  dateCreated: { type: Date, default: Date.now }, // When vote was cast
});

// Create compound index to ensure one vote per user per item
ThumbsSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

const Thumbs = mongoose.model("Thumbs", ThumbsSchema);
 
// Helper Functions and Middleware

// Create JWT token for user authentication with 30-minute expiration
const createToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30m" });

// Middleware to verify user authentication on protected routes
const verifyAuth = async (req, res, next) => {
  try {
    // Extract token from HTTP-only cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify token and extract user ID
    const { userId } = jwt.verify(token, JWT_SECRET);
    // Check if user still exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Add user info to request object for use in route handlers
    req.userId = userId;
    req.user = user;
    next(); // Continue to route handler
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication" });
  }
};
 
// AUTHENTICATION ENDPOINTS

// Register new user account
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Hash password before storing (never store plain text passwords)
    const hash = await bcrypt.hash(password, 10);
    // Create new user in database
    const user = await User.create({ username, email, password: hash });
   
    // Create authentication token
    const token = createToken(user._id);
    // Set HTTP-only cookie (more secure than localStorage)
    res.cookie("token", token, { httpOnly: true });
    // Return user data (excluding password)
    res.json({ _id: user._id, username: user.username, email: user.email, dateJoined: user.dateJoined });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
// Login existing user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find user by username
    const user = await User.findOne({ username });
    // Verify user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Felaktiga uppgifter" });
    }
   
    // Create authentication token
    const token = createToken(user._id);
    // Set HTTP-only cookie
    res.cookie("token", token, { httpOnly: true });
    // Return user data
    res.json({ _id: user._id, username: user.username, email: user.email, dateJoined: user.dateJoined });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
 
// Get current user information (check if logged in)
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    // No token means user is not logged in
    if (!token) return res.json({ user: null });
   
    // Verify token and get user data
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(userId).select("-password"); // Exclude password from response
    res.json({ user: user || null });
  } catch (error) {
    res.json({ user: null });
  }
});
 
// Logout user by clearing authentication cookie
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

// WATCHLIST ENDPOINTS - Manage user's saved items to watch/read later

// Get all items in user's watchlist
app.get("/api/watchlist", verifyAuth, async (req, res) => {
  try {
    // Find all watchlist items for the authenticated user, sorted by newest first
    const items = await Watchlist.find({ userId: req.userId }).sort({ dateAdded: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new item to user's watchlist
app.post("/api/watchlist", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle } = req.body;
    
    // Check if item already exists in user's watchlist to prevent duplicates
    const existing = await Watchlist.findOne({ 
      userId: req.userId, 
      itemId, 
      itemType 
    });
    
    if (existing) {
      return res.status(400).json({ error: "Item already in watchlist" });
    }
    
    // Create new watchlist item
    const item = await Watchlist.create({
      userId: req.userId,
      itemType,
      itemId,
      itemTitle,
    });
    
    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from user's watchlist
app.delete("/api/watchlist/:id", verifyAuth, async (req, res) => {
  try {
    // Find and delete watchlist item, ensuring it belongs to the authenticated user
    const item = await Watchlist.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REVIEW ENDPOINTS - Manage user reviews and ratings for media items

// Get all reviews written by the authenticated user
app.get("/api/reviews", verifyAuth, async (req, res) => {
  try {
    // Find all reviews by user, sorted by newest first
    const reviews = await Review.find({ userId: req.userId }).sort({ dateCreated: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new review or update existing review
app.post("/api/reviews", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle, rating, reviewText } = req.body;
    
    // Validate required fields
    if (!reviewText || !itemTitle) {
      return res.status(400).json({ error: "Review text and item title are required" });
    }
    
    // Check if user already has a review for this item
    let review = await Review.findOne({ 
      userId: req.userId, 
      itemId, 
      itemType 
    });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.reviewText = reviewText;
      review.dateCreated = new Date(); // Update timestamp
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        userId: req.userId,
        itemType,
        itemId,
        itemTitle,
        rating,
        reviewText,
      });
    }
    
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user's review
app.delete("/api/reviews/:id", verifyAuth, async (req, res) => {
  try {
    // Find and delete review, ensuring it belongs to the authenticated user
    const review = await Review.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's review for a specific item
app.get("/api/reviews/:itemType/:itemId", verifyAuth, async (req, res) => {
  try {
    // Find user's review for the specified item
    const review = await Review.findOne({ 
      userId: req.userId, 
      itemId: req.params.itemId, 
      itemType: req.params.itemType 
    });
    
    res.json({ review: review || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to verify server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working", timestamp: new Date().toISOString() });
});

// COMMUNITY RATINGS ENDPOINTS - Calculate aggregate ratings from all user reviews

// Get aggregated rating statistics for a specific media item (public endpoint)
app.get("/api/ratings/:itemType/:itemId", async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    // Get all ratings for this item from user reviews
    const reviews = await Review.find({ itemType, itemId }).select('rating');
    
    // Handle case where no reviews exist
    if (reviews.length === 0) {
      return res.json({ 
        itemType, 
        itemId, 
        median: null, 
        average: null, 
        count: 0,
        ratings: []
      });
    }
    
    // Extract non-null ratings
    const ratings = reviews.map(r => r.rating).filter(r => r != null);
    
    if (ratings.length === 0) {
      return res.json({ 
        itemType, 
        itemId, 
        median: null, 
        average: null, 
        count: 0,
        ratings: []
      });
    }
    
    // Calculate median rating
    const sortedRatings = ratings.sort((a, b) => a - b);
    const median = sortedRatings.length % 2 === 0
      ? (sortedRatings[sortedRatings.length / 2 - 1] + sortedRatings[sortedRatings.length / 2]) / 2
      : sortedRatings[Math.floor(sortedRatings.length / 2)];
    
    // Calculate average rating
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    // Count how many of each star rating (1-5) exist for distribution chart
    const distribution = [1, 2, 3, 4, 5].map(star => 
      ratings.filter(r => r === star).length
    );
    
    res.json({
      itemType,
      itemId,
      median: Math.round(median * 10) / 10, // Round to 1 decimal place
      average: Math.round(average * 10) / 10,
      count: ratings.length,
      distribution, // Array: [count of 1s, count of 2s, count of 3s, count of 4s, count of 5s]
      ratings: ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// THUMBS UP/DOWN ENDPOINTS - Manage user voting system for media items

// Get vote counts for a specific item (public endpoint - no authentication required)
app.get("/api/thumbs/:itemType/:itemId", async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    // Count thumbs up votes for this item
    const thumbsUp = await Thumbs.countDocuments({ itemType, itemId, voteType: 'up' });
    // Count thumbs down votes for this item
    const thumbsDown = await Thumbs.countDocuments({ itemType, itemId, voteType: 'down' });
    
    res.json({
      itemType,
      itemId,
      thumbsUp,
      thumbsDown,
      total: thumbsUp + thumbsDown,
      ratio: thumbsUp + thumbsDown > 0 ? thumbsUp / (thumbsUp + thumbsDown) : 0 // Percentage of positive votes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get the authenticated user's vote for a specific item
app.get("/api/thumbs/:itemType/:itemId/user", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    // Find user's existing vote for this item
    const userVote = await Thumbs.findOne({
      userId: req.userId,
      itemType,
      itemId
    });
    
    res.json({
      userVote: userVote ? userVote.voteType : null // Return 'up', 'down', or null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cast or update a thumbs up/down vote
app.post("/api/thumbs", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId, itemTitle, voteType } = req.body;
    
    // Validate vote type
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: "voteType must be 'up' or 'down'" });
    }
    
    // Check if user already has a vote for this item
    let existingVote = await Thumbs.findOne({
      userId: req.userId,
      itemType,
      itemId
    });
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // User clicked same vote again - toggle off (remove vote)
        await Thumbs.deleteOne({ _id: existingVote._id });
        return res.json({ 
          action: 'removed',
          previousVote: voteType,
          currentVote: null
        });
      } else {
        // User clicked opposite vote - update existing vote
        existingVote.voteType = voteType;
        existingVote.dateCreated = new Date(); // Update timestamp
        await existingVote.save();
        return res.json({ 
          action: 'updated',
          previousVote: existingVote.voteType === 'up' ? 'down' : 'up',
          currentVote: voteType,
          vote: existingVote
        });
      }
    } else {
      // User has no existing vote - create new vote
      const newVote = await Thumbs.create({
        userId: req.userId,
        itemType,
        itemId,
        itemTitle,
        voteType
      });
      
      return res.json({ 
        action: 'created',
        previousVote: null,
        currentVote: voteType,
        vote: newVote
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user's vote for a specific item
app.delete("/api/thumbs/:itemType/:itemId", verifyAuth, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    // Find and delete user's vote for this item
    const deletedVote = await Thumbs.findOneAndDelete({
      userId: req.userId,
      itemType,
      itemId
    });
    
    if (!deletedVote) {
      return res.status(404).json({ error: "Vote not found" });
    }
    
    res.json({ 
      action: 'removed',
      deletedVote: deletedVote.voteType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vote counts for multiple items in a single request (bulk operation)
app.post("/api/thumbs/bulk", async (req, res) => {
  try {
    const { items } = req.body; // Expected format: Array of {itemType, itemId}
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required" });
    }
    
    const results = [];
    
    // Process each item and get its vote counts
    for (const { itemType, itemId } of items) {
      const thumbsUp = await Thumbs.countDocuments({ itemType, itemId, voteType: 'up' });
      const thumbsDown = await Thumbs.countDocuments({ itemType, itemId, voteType: 'down' });
      
      results.push({
        itemType,
        itemId,
        thumbsUp,
        thumbsDown,
        total: thumbsUp + thumbsDown,
        ratio: thumbsUp + thumbsDown > 0 ? thumbsUp / (thumbsUp + thumbsDown) : 0
      });
    }
    
    res.json({ thumbs: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aggregated ratings for multiple items in a single request (bulk operation)
app.post("/api/ratings/bulk", async (req, res) => {
  try {
    const { items } = req.body; // Expected format: Array of {itemType, itemId}
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required" });
    }
    
    const results = [];
    
    // Process each item and calculate its aggregate ratings
    for (const { itemType, itemId } of items) {
      const reviews = await Review.find({ itemType, itemId }).select('rating');
      const ratings = reviews.map(r => r.rating).filter(r => r != null);
      
      if (ratings.length === 0) {
        // No ratings available for this item
        results.push({
          itemType,
          itemId,
          median: null,
          average: null,
          count: 0
        });
        continue;
      }
      
      // Calculate median and average ratings
      const sortedRatings = ratings.sort((a, b) => a - b);
      const median = sortedRatings.length % 2 === 0
        ? (sortedRatings[sortedRatings.length / 2 - 1] + sortedRatings[sortedRatings.length / 2]) / 2
        : sortedRatings[Math.floor(sortedRatings.length / 2)];
      
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      results.push({
        itemType,
        itemId,
        median: Math.round(median * 10) / 10,
        average: Math.round(average * 10) / 10,
        count: ratings.length
      });
    }
    
    res.json({ ratings: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all votes cast by the authenticated user for their profile
app.get("/api/thumbs/user", verifyAuth, async (req, res) => {
  try {
    // Find all votes by user, sorted by newest first
    const votes = await Thumbs.find({ userId: req.userId }).sort({ dateCreated: -1 });
    res.json({ votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// SERVER STARTUP AND DATABASE CONNECTION

// Connect to MongoDB database and start the server
mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("✅ MongoDB ansluten"); // MongoDB connected
  
  // Data migration: Add dateJoined field to existing users who don't have it
  try {
    const usersWithoutDate = await User.updateMany(
      { dateJoined: { $exists: false } }, // Find users missing dateJoined field
      { $set: { dateJoined: new Date() } } // Set current date as their join date
    );
    if (usersWithoutDate.modifiedCount > 0) {
      console.log(`📅 Updated ${usersWithoutDate.modifiedCount} users with dateJoined field`);
    }
  } catch (error) {
    console.log("Error updating users:", error.message);
  }
  
  // Start the Express server on all network interfaces (0.0.0.0)
  app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server på http://localhost:${PORT}`));
});
 